<?php
header('Content-Type: application/json; charset=utf-8');

$dataDir = __DIR__ . '/data';
$tipo = isset($_GET['tipo']) ? $_GET['tipo'] : 'clientes';

if ($tipo === 'calendario') {
    $file = $dataDir . '/calendario_notas.json';
} else {
    $file = $dataDir . '/clientes.json';
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    if (!file_exists($file)) {
        if ($tipo === 'calendario') {
            echo json_encode(new stdClass());
        } else {
            echo json_encode(['clientes' => [], 'notas' => '']);
        }
        exit;
    }
    echo file_get_contents($file);
    exit;
}

if ($method === 'POST') {
    $input = file_get_contents('php://input');
    $parsed = json_decode($input, true);
    if (!is_array($parsed) && !is_object($parsed)) {
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
