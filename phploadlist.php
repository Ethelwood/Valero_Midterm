<?php
    require "phpconnect.php";

    //SQL query to retrieve data from the products table
    $sql = "select * from snake_table";

    //Execute the query
    $stmt = sqlsrv_query($conn, $sql);

    if($stmt === false) {
        die(json_encode(array("error" => "Query failed")));
    }

    $snakelist = array();

    while($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
        $snakelist[] = array(
            "name" => $row["sname"],
            "color" => $row["scolor"],
        );
    }

    $jsonData = $todolist;

    echo json_encode($jsonData);
?>