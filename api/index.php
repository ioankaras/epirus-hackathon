<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type, X-Device-Id');

require __DIR__ . '/db.php';

$uid = (int) ($_SERVER['HTTP_X_DEVICE_ID'] ?? 1);
if ($uid <= 0) {
    $uid = 1;
}

$db     = get_db();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$path   = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
$path   = rtrim($path, '/');

// POST /mock-api/transfer
if ($path === '/mock-api/transfer' && $method === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true) ?? [];

    $fromAccount = $body['fromAccount'] ?? null;
    $toAccount   = $body['toAccount']   ?? null;
    $amount      = $body['amount']      ?? null;

    if ($fromAccount === null || $toAccount === null || $amount === null) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required fields: fromAccount, toAccount, amount']);
        exit;
    }

    $amount = (float) $amount;
    if ($amount <= 0.0) {
        http_response_code(400);
        echo json_encode(['error' => 'Amount must be greater than zero']);
        exit;
    }

    // Verify fromAccount belongs to the caller
    $stmtFrom = $db->prepare('SELECT id, balance FROM accounts WHERE id = :id AND user_id = :uid');
    $stmtFrom->execute([':id' => $fromAccount, ':uid' => $uid]);
    $sender = $stmtFrom->fetch();
    if (!$sender) {
        http_response_code(403);
        echo json_encode(['error' => 'Account does not belong to you']);
        exit;
    }

    // Verify toAccount exists
    $stmtTo = $db->prepare('SELECT id FROM accounts WHERE id = :id');
    $stmtTo->execute([':id' => $toAccount]);
    if (!$stmtTo->fetch()) {
        http_response_code(404);
        echo json_encode(['error' => 'Destination account not found']);
        exit;
    }

    // Verify sufficient balance
    if ($sender['balance'] < $amount) {
        http_response_code(422);
        echo json_encode(['error' => 'Insufficient balance']);
        exit;
    }

    // Atomic transfer
    $now  = (new DateTime())->format('Y-m-d\TH:i:s\Z');

    $db->beginTransaction();
    try {
        $db->prepare('UPDATE accounts SET balance = balance - :amt, last_updated = :now WHERE id = :id')
           ->execute([':amt' => $amount, ':now' => $now, ':id' => $fromAccount]);

        $db->prepare('UPDATE accounts SET balance = balance + :amt, last_updated = :now WHERE id = :id')
           ->execute([':amt' => $amount, ':now' => $now, ':id' => $toAccount]);

        // Debit tx for sender
        $maxTx = $db->query("SELECT MAX(CAST(SUBSTR(id, 2) AS INTEGER)) FROM transactions WHERE id LIKE 't%'")->fetchColumn();
        $nextTxNum = ($maxTx === null ? 0 : (int)$maxTx) + 1;
        $txDebitId = sprintf('t%04d', $nextTxNum);
        $db->prepare('INSERT INTO transactions (id, account_id, user_id, type, description, amount, currency, date, recipient)
                      VALUES (:id, :aid, :uid, "debit", "Transfer sent", :amt, "EUR", :date, :to)')
           ->execute([':id' => $txDebitId, ':aid' => $fromAccount, ':uid' => $uid,
                      ':amt' => $amount, ':date' => $now, ':to' => $toAccount]);

        // Credit tx for receiver (look up receiver's user_id)
        $receiverUid = $db->prepare('SELECT user_id FROM accounts WHERE id = :id');
        $receiverUid->execute([':id' => $toAccount]);
        $receiverRow = $receiverUid->fetch();

        $txCreditId = sprintf('t%04d', $nextTxNum + 1);
        $db->prepare('INSERT INTO transactions (id, account_id, user_id, type, description, amount, currency, date, recipient)
                      VALUES (:id, :aid, :uid, "credit", "Transfer received", :amt, "EUR", :date, :from)')
           ->execute([':id' => $txCreditId, ':aid' => $toAccount, ':uid' => $receiverRow['user_id'],
                      ':amt' => $amount, ':date' => $now, ':from' => $fromAccount]);

        $db->commit();
    } catch (Exception $e) {
        $db->rollBack();
        http_response_code(500);
        echo json_encode(['error' => 'Transfer failed']);
        exit;
    }

    // Return updated sender account
    $stmtUpdated = $db->prepare('SELECT id, name, account_number AS accountNumber, balance, last_updated AS lastUpdated FROM accounts WHERE id = :id');
    $stmtUpdated->execute([':id' => $fromAccount]);
    $updatedRow = $stmtUpdated->fetch();
    $updatedRow['balance']  = (float) $updatedRow['balance'];
    $updatedRow['currency'] = 'EUR';
    echo json_encode($updatedRow, JSON_PRETTY_PRINT);
    exit;
}

// Transactions for an account: /mock-api/accounts/{id}/transactions
if (preg_match('#^/mock-api/accounts/(a\d+)/transactions$#', $path, $m)) {
    $check = $db->prepare('SELECT id FROM accounts WHERE id = :id AND user_id = :uid');
    $check->execute([':id' => $m[1], ':uid' => $uid]);
    if (!$check->fetch()) {
        http_response_code(404);
        echo json_encode(['error' => 'Account not found']);
        exit;
    }
    $stmt = $db->prepare('SELECT id, type, description, amount, date, account_id AS accountId, recipient FROM transactions WHERE account_id = :aid AND user_id = :uid ORDER BY date DESC');
    $stmt->execute([':aid' => $m[1], ':uid' => $uid]);
    $rows = $stmt->fetchAll();
    foreach ($rows as &$row) {
        $row['amount']   = (float) $row['amount'];
        $row['currency'] = 'EUR';
        if ($row['recipient'] === null) {
            unset($row['recipient']);
        }
    }
    echo json_encode(array_values($rows), JSON_PRETTY_PRINT);
    exit;
}

// Single account (by X-Device-Id): /mock-api/accounts
if ($path === '/mock-api/accounts') {
    $stmt = $db->prepare('SELECT a.id, a.name, a.account_number AS accountNumber, a.balance, a.last_updated AS lastUpdated, u.first_name || \' \' || u.last_name AS owner FROM accounts a JOIN users u ON u.id = a.user_id WHERE a.user_id = :uid LIMIT 1');
    $stmt->execute([':uid' => $uid]);
    $row = $stmt->fetch();
    if (!$row) {
        http_response_code(404);
        echo json_encode(['error' => 'Account not found']);
        exit;
    }
    $row['balance']  = (float) $row['balance'];
    $row['currency'] = 'EUR';
    echo json_encode($row, JSON_PRETTY_PRINT);
    exit;
}

// All transactions: /mock-api/transactions
if ($path === '/mock-api/transactions') {
    $stmt = $db->prepare('SELECT t.id, t.type, t.description, t.amount, t.date, t.account_id AS accountId, t.recipient FROM transactions t WHERE t.user_id = :uid ORDER BY t.date DESC');
    $stmt->execute([':uid' => $uid]);
    $rows = $stmt->fetchAll();
    foreach ($rows as &$row) {
        $row['amount']   = (float) $row['amount'];
        $row['currency'] = 'EUR';
        if ($row['recipient'] === null) {
            unset($row['recipient']);
        }
    }
    echo json_encode(array_values($rows), JSON_PRETTY_PRINT);
    exit;
}

// Single contact: /mock-api/contacts/{id}
if (preg_match('#^/mock-api/contacts/(c\d+)$#', $path, $m)) {
    $stmt = $db->prepare('SELECT c.id, c.name, c.account_number AS accountNumber, a.id AS accountId, c.initials FROM contacts c LEFT JOIN accounts a ON a.user_id = CAST(SUBSTR(c.id, 2) AS INTEGER) WHERE c.id = :id');
    $stmt->execute([':id' => $m[1]]);
    $row = $stmt->fetch();
    if (!$row) {
        http_response_code(404);
        echo json_encode(['error' => 'Contact not found']);
    } else {
        echo json_encode($row, JSON_PRETTY_PRINT);
    }
    exit;
}

// All contacts (global, unscoped): /mock-api/contacts
if ($path === '/mock-api/contacts') {
    $stmt = $db->query('SELECT c.id, c.name, c.account_number AS accountNumber, a.id AS accountId, c.initials FROM contacts c LEFT JOIN accounts a ON a.user_id = CAST(SUBSTR(c.id, 2) AS INTEGER) ORDER BY c.id');
    echo json_encode($stmt->fetchAll(), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    exit;
}

// Bills: /mock-api/bills
if ($path === '/mock-api/bills') {
    $bills = [
        [
            'rf'       => 'RF84903148000001134433136',
            'category' => 'Τηλεφωνία',
            'currency' => 'EUR',
            'amount'   => 21.66,
            'due_date' => '2026-05-31T15:43:01.402Z',
            'provider' => 'e-Bill',
        ],
    ];
    echo json_encode($bills, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    exit;
}

http_response_code(404);
echo json_encode(['error' => 'Not found', 'available' => ['/mock-api/accounts', '/mock-api/transactions', '/mock-api/contacts', '/mock-api/bills', '/mock-api/transfer']]);
