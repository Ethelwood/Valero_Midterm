<?php

    $serverName = "LAPTOP-R6ROOL17\SQLEXPRESS";
    $connectionInfo = array(
        "Database" => "snakes",
        "UID" => "",
        "PWD" => ""
    );

    $conn = sqlsrv_connect($serverName, $connectionInfo);

    if ($conn) {
        echo "Connection is successful.<br>";
    } else {
        error_log(print_r(sqlsrv_errors(), true));
        die("Database connection failed. Please try again later.");
    }

?>