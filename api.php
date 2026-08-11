<?php
header('Content-Type: application/json; charset=utf-8');

$dataDir = __DIR__ . '/data';
$file = $dataDir . '/clientes.json';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    if (!file_exists($file)) {
        echo json_encode(['clientes' => [], 'notas' => '']);
        exit;
    }
    $raw = file_get_contents($file);
    $data = json_decode($raw, true);
    if (!is_array($data) || !array_key_exists('clientes', $data)) {
        $data = ['clientes' => [], 'notas' => ''];
    }
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

if ($method === 'POST') {
    $input = file_get_contents('php://input');
    $parsed = json_decode($input, true);
    if (!is_array($parsed) || !array_key_exists('clientes', $parsed)) {
        http_response_code(400);
        echo json_encode(['error' => 'payload invalido']);
        exit;
    }
    if (!is_dir($dataDir)) {
        @mkdir($dataDir, 0775, true);
    }
    $ok = file_put_contents($file, json_encode($parsed, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT), LOCK_EX);
    if ($ok === false) {
        http_response_code(500);
        echo json_encode(['error' => 'no se pudo escribir']);
        exit;
    }
    echo json_encode(['ok' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'metodo no permitido']);
