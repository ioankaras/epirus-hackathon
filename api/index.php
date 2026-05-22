<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

$accounts = [
    [
        'id' => 'a1001',
        'name' => 'Main Checking',
        'accountNumber' => 'GR16 0110 1250 0000 0001 2300 695',
        'balance' => 4821.50,
        'currency' => 'EUR',
        'lastUpdated' => '2026-05-22T08:00:00Z',
    ],
    [
        'id' => 'a1002',
        'name' => 'Savings Account',
        'accountNumber' => 'GR16 0110 1250 0000 0001 2300 696',
        'balance' => 12340.00,
        'currency' => 'EUR',
        'lastUpdated' => '2026-05-21T18:30:00Z',
    ],
    [
        'id' => 'a1003',
        'name' => 'Business Account',
        'accountNumber' => 'GR16 0110 1250 0000 0001 2300 697',
        'balance' => 31500.75,
        'currency' => 'EUR',
        'lastUpdated' => '2026-05-22T09:15:00Z',
    ],
];

$contacts = [
    ['id' => 'c1001', 'name' => 'Nikos Papadopoulos', 'accountNumber' => 'GR16 0110 1250 0000 0002 1000 001', 'initials' => 'NP'],
    ['id' => 'c1002', 'name' => 'Maria Georgiou',     'accountNumber' => 'GR16 0110 1250 0000 0002 1000 002', 'initials' => 'MG'],
    ['id' => 'c1003', 'name' => 'Dimitris Alexiou',   'accountNumber' => 'GR16 0110 1250 0000 0002 1000 003', 'initials' => 'DA'],
    ['id' => 'c1004', 'name' => 'Sofia Thanou',       'accountNumber' => 'GR16 0110 1250 0000 0002 1000 004', 'initials' => 'ST'],
    ['id' => 'c1005', 'name' => 'Kostas Pappas',      'accountNumber' => 'GR16 0110 1250 0000 0002 1000 005', 'initials' => 'KP'],
    ['id' => 'c1006', 'name' => 'Elena Vasileiou',    'accountNumber' => 'GR16 0110 1250 0000 0002 1000 006', 'initials' => 'EV'],
    ['id' => 'c1007', 'name' => 'Yannis Stavrou',     'accountNumber' => 'GR16 0110 1250 0000 0002 1000 007', 'initials' => 'YS'],
    ['id' => 'c1008', 'name' => 'Anna Makri',         'accountNumber' => 'GR16 0110 1250 0000 0002 1000 008', 'initials' => 'AM'],
    ['id' => 'c1009', 'name' => 'Petros Nikolaou',    'accountNumber' => 'GR16 0110 1250 0000 0002 1000 009', 'initials' => 'PN'],
    ['id' => 'c1010', 'name' => 'Chrysa Lamprou',     'accountNumber' => 'GR16 0110 1250 0000 0002 1000 010', 'initials' => 'CL'],
];

$bills = [
    ['id' => 'b1001', 'provider' => 'DEH',          'amount' => 87.40,  'currency' => 'EUR', 'dueDate' => '2026-06-05', 'status' => 'unpaid', 'category' => 'electricity', 'rf' => 'RF12 3456 7890 1234'],
    ['id' => 'b1002', 'provider' => 'EYDAP',        'amount' => 32.10,  'currency' => 'EUR', 'dueDate' => '2026-06-10', 'status' => 'unpaid', 'category' => 'water',       'rf' => 'RF23 4567 8901 2345'],
    ['id' => 'b1003', 'provider' => 'Cosmote',      'amount' => 49.99,  'currency' => 'EUR', 'dueDate' => '2026-05-28', 'status' => 'unpaid', 'category' => 'phone',       'rf' => 'RF34 5678 9012 3456'],
    ['id' => 'b1004', 'provider' => 'Vodafone',     'amount' => 29.99,  'currency' => 'EUR', 'dueDate' => '2026-05-30', 'status' => 'paid',   'category' => 'internet',    'rf' => 'RF45 6789 0123 4567'],
    ['id' => 'b1005', 'provider' => 'EDA Attikis',  'amount' => 61.80,  'currency' => 'EUR', 'dueDate' => '2026-06-15', 'status' => 'unpaid', 'category' => 'gas',         'rf' => 'RF56 7890 1234 5678'],
    ['id' => 'b1006', 'provider' => 'DEH',          'amount' => 74.20,  'currency' => 'EUR', 'dueDate' => '2026-05-01', 'status' => 'paid',   'category' => 'electricity', 'rf' => 'RF67 8901 2345 6789'],
    ['id' => 'b1007', 'provider' => 'Wind',         'amount' => 39.99,  'currency' => 'EUR', 'dueDate' => '2026-06-20', 'status' => 'unpaid', 'category' => 'internet',    'rf' => 'RF78 9012 3456 7890'],
    ['id' => 'b1008', 'provider' => 'EYDAP',        'amount' => 28.60,  'currency' => 'EUR', 'dueDate' => '2026-04-30', 'status' => 'paid',   'category' => 'water',       'rf' => 'RF89 0123 4567 8901'],
    ['id' => 'b1009', 'provider' => 'Nova',         'amount' => 54.99,  'currency' => 'EUR', 'dueDate' => '2026-06-01', 'status' => 'unpaid', 'category' => 'phone',       'rf' => 'RF90 1234 5678 9012'],
    ['id' => 'b1010', 'provider' => 'EDA Attikis',  'amount' => 55.30,  'currency' => 'EUR', 'dueDate' => '2026-05-10', 'status' => 'paid',   'category' => 'gas',         'rf' => 'RF01 2345 6789 0123'],
];

$accountIds   = ['a1001', 'a1002', 'a1003'];
$contactNames = array_column($contacts, 'name');

$txDescriptions = [
    'debit'  => [
        'Supermarket purchase', 'Coffee shop', 'Online shopping', 'Fuel station',
        'Restaurant dinner', 'Pharmacy', 'Gym membership', 'Streaming subscription',
        'Utility payment', 'ATM withdrawal', 'Public transport', 'Bookstore',
        'Transfer to contact', 'Insurance premium', 'Mobile top-up',
    ],
    'credit' => [
        'Salary deposit', 'Freelance payment', 'Transfer received', 'Refund',
        'Bonus payment', 'Dividend', 'Rental income', 'Client invoice paid',
    ],
];

$transactions = [];
$baseDate = new DateTime('2026-05-22');

for ($i = 1; $i <= 100; $i++) {
    $type      = ($i % 3 === 0) ? 'credit' : 'debit';
    $accountId = $accountIds[($i - 1) % 3];
    $descList  = $txDescriptions[$type];
    $desc      = $descList[($i - 1) % count($descList)];
    $amount    = round(5 + ($i * 7.37) % 995, 2);
    $daysAgo   = ($i - 1) % 90;
    $date      = (clone $baseDate)->modify("-{$daysAgo} days")->format('Y-m-d');
    $recipient = null;

    if ($type === 'debit' && str_contains($desc, 'contact')) {
        $recipient = $contactNames[($i - 1) % count($contactNames)];
    } elseif ($type === 'credit' && in_array($desc, ['Transfer received', 'Client invoice paid', 'Freelance payment'])) {
        $recipient = $contactNames[($i - 1) % count($contactNames)];
    }

    $tx = [
        'id'          => sprintf('t%04d', $i),
        'type'        => $type,
        'description' => $desc,
        'amount'      => $amount,
        'currency'    => 'EUR',
        'date'        => $date,
        'accountId'   => $accountId,
    ];

    if ($recipient !== null) {
        $tx['recipient'] = $recipient;
    }

    $transactions[] = $tx;
}

$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
$path = rtrim($path, '/');

// Individual account: /accounts/{id}
if (preg_match('#^/accounts/(a\d{4})$#', $path, $m)) {
    $found = array_values(array_filter($accounts, fn($a) => $a['id'] === $m[1]));
    if (empty($found)) {
        http_response_code(404);
        echo json_encode(['error' => 'Account not found']);
    } else {
        echo json_encode($found[0], JSON_PRETTY_PRINT);
    }
    exit;
}

// Transactions filtered by account: /accounts/{id}/transactions
if (preg_match('#^/accounts/(a\d{4})/transactions$#', $path, $m)) {
    $exists = array_filter($accounts, fn($a) => $a['id'] === $m[1]);
    if (empty($exists)) {
        http_response_code(404);
        echo json_encode(['error' => 'Account not found']);
    } else {
        $filtered = array_values(array_filter($transactions, fn($t) => $t['accountId'] === $m[1]));
        echo json_encode($filtered, JSON_PRETTY_PRINT);
    }
    exit;
}

$routes = [
    '/accounts'     => $accounts,
    '/transactions' => $transactions,
    '/contacts'     => $contacts,
    '/bills'        => $bills,
];

if (array_key_exists($path, $routes)) {
    echo json_encode($routes[$path], JSON_PRETTY_PRINT);
} else {
    http_response_code(404);
    echo json_encode(['error' => 'Not found', 'available' => ['/accounts', '/transactions', '/contacts', '/bills']]);
}
