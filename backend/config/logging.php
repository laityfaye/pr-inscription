<?php

use Monolog\Handler\NullHandler;
use Monolog\Handler\StreamHandler;
use Monolog\Handler\SyslogUdpHandler;
use Monolog\Processor\PsrLogMessageProcessor;

// Vérifier si le logging peut fonctionner
$canLogToFile = false;
try {
    $logPath = storage_path('logs/laravel.log');
    $logDir = dirname($logPath);
    
    // Créer le répertoire s'il n'existe pas
    if (!is_dir($logDir)) {
        @mkdir($logDir, 0755, true);
    }
    
    // Vérifier si on peut écrire dans le répertoire
    if (is_dir($logDir) && is_writable($logDir)) {
        // Tester si on peut créer/écrire un fichier
        $testFile = $logDir . '/.test_write';
        if (@file_put_contents($testFile, 'test') !== false) {
            @unlink($testFile);
            $canLogToFile = true;
        }
    }
} catch (\Throwable $e) {
    // En cas d'erreur, ne pas logger vers le fichier
    $canLogToFile = false;
}

return [
    'default' => $canLogToFile ? env('LOG_CHANNEL', 'stack') : 'null',

    'deprecations' => [
        'channel' => env('LOG_DEPRECATIONS_CHANNEL', 'null'),
        'trace' => false,
    ],

    'channels' => [
        'stack' => [
            'driver' => 'stack',
            'channels' => ['single'],
            'ignore_exceptions' => false,
        ],

        'single' => [
            'driver' => $canLogToFile ? 'single' : 'null',
            'path' => storage_path('logs/laravel.log'),
            'level' => env('LOG_LEVEL', 'debug'),
            'replace_placeholders' => true,
        ],

        'daily' => [
            'driver' => $canLogToFile ? 'daily' : 'null',
            'path' => storage_path('logs/laravel.log'),
            'level' => env('LOG_LEVEL', 'debug'),
            'days' => 14,
            'replace_placeholders' => true,
        ],

        'null' => [
            'driver' => 'monolog',
            'handler' => NullHandler::class,
        ],

        'emergency' => [
            'path' => storage_path('logs/laravel.log'),
        ],
    ],
];

