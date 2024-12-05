<?php
    require "phpconnect.php"; // Ensure your DB connection is established

    // SQL query to retrieve snake data from the database
    $sql = "SELECT sname, scolor FROM snakes";  // Adjust table and column names as needed

    // Execute the query
    $stmt = sqlsrv_query($conn, $sql);

    if ($stmt === false) {
        // If the query fails, return an error
        die(json_encode(array("error" => "Query failed")));
    }

    // Initialize an array to hold snake data
    $snakelist = array();

    // Fetch data and store it in the $snakelist array
    while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
        $snakelist[] = array(
            "sname" => $row["sname"],    // Snake name
            "scolor" => $row["scolor"],  // Snake color
        );
    }

    // Return the data as a JSON object to be handled in JavaScript
    echo json_encode($snakelist);

    // Close the database connection (optional, PHP will do this when the script ends)
    sqlsrv_close($conn);
?>
