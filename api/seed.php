<?php

require __DIR__ . '/db.php';

$db = get_db();

// ── Schema ────────────────────────────────────────────────────────────────────

$db->exec('DROP TABLE IF EXISTS bills');
$db->exec('DROP TABLE IF EXISTS transactions');
$db->exec('DROP TABLE IF EXISTS contacts');
$db->exec('DROP TABLE IF EXISTS accounts');
$db->exec('DROP TABLE IF EXISTS users');

$db->exec('
    CREATE TABLE users (
        id         INTEGER PRIMARY KEY,
        first_name TEXT NOT NULL,
        last_name  TEXT NOT NULL
    )
');

$db->exec('
    CREATE TABLE accounts (
        id             TEXT    PRIMARY KEY,
        user_id        INTEGER NOT NULL REFERENCES users(id),
        name           TEXT    NOT NULL,
        account_number TEXT    NOT NULL,
        balance        REAL    NOT NULL,
        currency       TEXT    NOT NULL DEFAULT "EUR",
        last_updated   TEXT    NOT NULL
    )
');

$db->exec('
    CREATE TABLE transactions (
        id          TEXT    PRIMARY KEY,
        account_id  TEXT    NOT NULL REFERENCES accounts(id),
        user_id     INTEGER NOT NULL REFERENCES users(id),
        type        TEXT    NOT NULL,
        description TEXT    NOT NULL,
        amount      REAL    NOT NULL,
        currency    TEXT    NOT NULL DEFAULT "EUR",
        date        TEXT    NOT NULL,
        recipient   TEXT
    )
');

$db->exec('
    CREATE TABLE contacts (
        id             TEXT    PRIMARY KEY,
        name           TEXT    NOT NULL,
        account_number TEXT    NOT NULL,
        initials       TEXT    NOT NULL
    )
');

$db->exec('
    CREATE TABLE bills (
        id       TEXT    PRIMARY KEY,
        user_id  INTEGER NOT NULL REFERENCES users(id),
        provider TEXT    NOT NULL,
        amount   REAL    NOT NULL,
        currency TEXT    NOT NULL DEFAULT "EUR",
        due_date TEXT    NOT NULL,
        status   TEXT    NOT NULL,
        category TEXT    NOT NULL,
        rf       TEXT    NOT NULL
    )
');

// ── Greek names pool ──────────────────────────────────────────────────────────

$maleNames = [
    'Νίκος', 'Γιάννης', 'Κώστας', 'Δημήτρης', 'Παναγιώτης',
    'Γιώργης', 'Βασίλης', 'Αλέξανδρος', 'Θανάσης', 'Σταύρος',
    'Πέτρος', 'Χρήστος', 'Μιχάλης', 'Ανδρέας', 'Θοδωρής',
    'Λευτέρης', 'Σπύρος', 'Αντώνης', 'Νεκτάριος', 'Κλεάνθης',
    'Ηλίας', 'Στέφανος', 'Αριστείδης', 'Φώτης', 'Μάρκος',
    'Δαμιανός', 'Κυριάκος', 'Θεόδωρος', 'Ευάγγελος', 'Παύλος',
];

$femaleNames = [
    'Μαρία', 'Ελένη', 'Σοφία', 'Κατερίνα', 'Ανδριάνα',
    'Δήμητρα', 'Χρυσούλα', 'Αναστασία', 'Βασιλική', 'Ιωάννα',
    'Νικολέτα', 'Θεοδώρα', 'Αγγελική', 'Παρασκευή', 'Αλεξάνδρα',
    'Γεωργία', 'Κλεοπάτρα', 'Πηνελόπη', 'Αρτεμισία', 'Σταυρούλα',
    'Ειρήνη', 'Ζωή', 'Αφροδίτη', 'Μαγδαληνή', 'Ρόζα',
    'Κυριακή', 'Μελίνα', 'Καλλιόπη', 'Λαμπρινή', 'Ολυμπία',
];

$surnames = [
    'Παπαδόπουλος', 'Γεωργίου', 'Νικολάου', 'Παπαδάκης', 'Αλεξίου',
    'Βασιλείου', 'Αναστασίου', 'Δημητρίου', 'Παππάς', 'Κωνσταντίνου',
    'Μιχαηλίδης', 'Κωστόπουλος', 'Σταυρόπουλος', 'Θεοδωρόπουλος', 'Αντωνίου',
    'Σπυρόπουλος', 'Μαρκόπουλος', 'Χριστοδούλου', 'Λεβέντης', 'Καραγιάννης',
    'Τσιώλης', 'Μπακόπουλος', 'Ζαχαρόπουλος', 'Γκίκας', 'Λάμπρου',
    'Πανταζής', 'Κουτσούμπας', 'Μουστάκας', 'Γαλάνης', 'Ρούσσος',
    'Τριανταφύλλου', 'Βλάχος', 'Κεφαλάς', 'Δούκας', 'Σαββίδης',
    'Μαμάς', 'Σιδέρης', 'Παπακώστας', 'Γιαννόπουλος', 'Φωτόπουλος',
    'Κατσαρός', 'Χαλκίδης', 'Πολίτης', 'Αλεξανδρής', 'Μανώλης',
    'Δρακόπουλος', 'Ζέρβας', 'Μπαλής', 'Τσώνης', 'Νταής',
];

// ── Helper functions ──────────────────────────────────────────────────────────

function iban(int $uid, int $accountIdx): string {
    $base = str_pad((string)($uid * 10 + $accountIdx), 10, '0', STR_PAD_LEFT);
    return "GR16 0110 1250 0000 {$base}";
}

function rf(int $uid, int $billIdx): string {
    $n = str_pad((string)($uid * 100 + $billIdx), 12, '0', STR_PAD_LEFT);
    return "RF{$n}";
}

// ── Seed ──────────────────────────────────────────────────────────────────────

$allNames = [];
for ($i = 0; $i < 100; $i++) {
    if ($i % 2 === 0) {
        $first = $maleNames[$i % count($maleNames)];
    } else {
        $first = $femaleNames[$i % count($femaleNames)];
    }
    $last = $surnames[$i % count($surnames)];
    $allNames[] = [$first, $last];
}

$insertUser = $db->prepare('INSERT INTO users (id, first_name, last_name) VALUES (:id, :first, :last)');
$insertAccount = $db->prepare('
    INSERT INTO accounts (id, user_id, name, account_number, balance, currency, last_updated)
    VALUES (:id, :uid, :name, :anum, :balance, "EUR", :updated)
');
$insertTx = $db->prepare('
    INSERT INTO transactions (id, account_id, user_id, type, description, amount, currency, date, recipient)
    VALUES (:id, :aid, :uid, :type, :desc, :amount, "EUR", :date, :recipient)
');
$insertContact = $db->prepare('
    INSERT INTO contacts (id, name, account_number, initials)
    VALUES (:id, :name, :anum, :initials)
');
$insertBill = $db->prepare('
    INSERT INTO bills (id, user_id, provider, amount, currency, due_date, status, category, rf)
    VALUES (:id, :uid, :provider, :amount, "EUR", :due, :status, :cat, :rf)
');

$accountNames   = ['Main Checking', 'Savings Account', 'Business Account', 'Investment Account', 'Joint Account'];
$debitDescs     = [
    'Supermarket purchase', 'Coffee shop', 'Online shopping', 'Fuel station',
    'Restaurant dinner', 'Pharmacy', 'Gym membership', 'Streaming subscription',
    'Utility payment', 'ATM withdrawal', 'Public transport', 'Bookstore',
    'Insurance premium', 'Mobile top-up', 'Clothing store',
];
$creditDescs    = [
    'Salary deposit', 'Freelance payment', 'Transfer received', 'Refund',
    'Bonus payment', 'Dividend', 'Rental income', 'Client invoice paid',
];
$billProviders  = [
    ['DEH',         'electricity'],
    ['EYDAP',       'water'],
    ['Cosmote',     'phone'],
    ['Vodafone',    'internet'],
    ['EDA Attikis', 'gas'],
    ['Wind',        'internet'],
    ['Nova',        'phone'],
    ['OTE',         'phone'],
];

$txCounter      = 1;
$contactCounter = 1;
$billCounter    = 1;
$baseDate       = new DateTime('2026-05-22');

$db->beginTransaction();

foreach ($allNames as $idx => [$first, $last]) {
    $uid = $idx + 1;

    $insertUser->execute([':id' => $uid, ':first' => $first, ':last' => $last]);

    // exactly 1 account per user
    $aid     = sprintf('a%04d', $uid);
    $balance = round(500 + fmod($uid * 137.3, 49500), 2);
    $updated = $baseDate->format('Y-m-d\TH:i:s\Z');
    $aNum    = iban($uid, 1);

    $insertAccount->execute([
        ':id'      => $aid,
        ':uid'     => $uid,
        ':name'    => 'Main Checking',
        ':anum'    => $aNum,
        ':balance' => $balance,
        ':updated' => $updated,
    ]);

    // exactly 50 transactions
    $numTx = 50;
    for ($t = 0; $t < $numTx; $t++) {
        $txId     = sprintf('t%04d', $txCounter++);
        // $aid already set to this user's single account
        $type     = ($t % 3 === 0) ? 'credit' : 'debit';
        $descs    = $type === 'credit' ? $creditDescs : $debitDescs;
        $desc     = $descs[$t % count($descs)];
        $amount   = round(5 + fmod($uid * 7.37 + $t * 13.11, 995), 2);
        $date     = (clone $baseDate)->modify("-{$t} hours")->format('Y-m-d\TH:i:s\Z');
        $recipient = null;

        if ($type === 'credit' && in_array($desc, ['Transfer received', 'Client invoice paid', 'Freelance payment'])) {
            $recipient = $allNames[($uid + $t) % 100][0] . ' ' . $allNames[($uid + $t) % 100][1];
        }

        $insertTx->execute([
            ':id'        => $txId,
            ':aid'       => $aid,
            ':uid'       => $uid,
            ':type'      => $type,
            ':desc'      => $desc,
            ':amount'    => $amount,
            ':date'      => $date,
            ':recipient' => $recipient,
        ]);
    }

    // 3–6 bills
    $numBills = 3 + ($uid % 4);
    for ($b = 0; $b < $numBills; $b++) {
        $bid      = sprintf('b%04d', $billCounter++);
        [$prov, $cat] = $billProviders[($uid + $b) % count($billProviders)];
        $amount   = round(20 + fmod($uid * 5.3 + $b * 11.7, 150), 2);
        $daysUntil = 5 + (($uid + $b * 7) % 30);
        $due      = (clone $baseDate)->modify("+{$daysUntil} days")->format('Y-m-d');
        $status   = ($b % 3 === 0) ? 'paid' : 'unpaid';
        $rfVal    = rf($uid, $b + 1);

        $insertBill->execute([
            ':id'       => $bid,
            ':uid'      => $uid,
            ':provider' => $prov,
            ':amount'   => $amount,
            ':due'      => $due,
            ':status'   => $status,
            ':cat'      => $cat,
            ':rf'       => $rfVal,
        ]);
    }
}

// Global contact book — one entry per user
foreach ($allNames as $idx => [$first, $last]) {
    $uid      = $idx + 1;
    $name     = $first . ' ' . $last;
    $initials = mb_substr($first, 0, 1) . mb_substr($last, 0, 1);
    $aNum     = iban($uid, 0);

    $insertContact->execute([
        ':id'       => sprintf('c%04d', $uid),
        ':name'     => $name,
        ':anum'     => $aNum,
        ':initials' => $initials,
    ]);
}

$db->commit();

// Summary
echo "Seeding complete.\n";
echo "Users:        " . $db->query('SELECT COUNT(*) FROM users')->fetchColumn() . "\n";
echo "Accounts:     " . $db->query('SELECT COUNT(*) FROM accounts')->fetchColumn() . "\n";
echo "Transactions: " . $db->query('SELECT COUNT(*) FROM transactions')->fetchColumn() . "\n";
echo "Contacts:     " . $db->query('SELECT COUNT(*) FROM contacts')->fetchColumn() . "\n";
echo "Bills:        " . $db->query('SELECT COUNT(*) FROM bills')->fetchColumn() . "\n";
