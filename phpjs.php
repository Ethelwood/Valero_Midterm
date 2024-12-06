<?php
require 'phpconnect.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $action = $_POST['action'];
    $response = ['status' => 'error', 'message' => 'Invalid action'];

    if ($action === 'saveSnake') {
        $sname = htmlspecialchars(trim($_POST['sname']));
        $scolor = htmlspecialchars(trim($_POST['scolor']));
        $score = intval($_POST['score']);
    
        // SQL Server MERGE statement to insert or update
        $query = "
            MERGE INTO snable AS target
            USING (SELECT ? AS sname, ? AS scolor, ? AS score) AS source
            ON target.sname = source.sname
            WHEN MATCHED THEN
                UPDATE SET target.scolor = source.scolor, target.score = GREATEST(target.score, source.score)
            WHEN NOT MATCHED THEN
                INSERT (sname, scolor, score)
                VALUES (source.sname, source.scolor, source.score);
        ";
    
        // Prepare the statement
        $stmt = sqlsrv_prepare($conn, $query, [$sname, $scolor, $score]);
    
        // Execute the statement and handle success or failure
        if (sqlsrv_execute($stmt)) {
            $response = ['status' => 'success', 'message' => "$sname saved successfully!"];
        } else {
            $response['message'] = 'Database error: ' . print_r(sqlsrv_errors(), true);
        }
    }
    

    if ($action === 'getSnake') {
        $sname = htmlspecialchars(trim($_POST['sname']));
        $query = "SELECT sname, scolor, score FROM snable WHERE sname = ?";
        $stmt = sqlsrv_prepare($conn, $query, [$sname]);

        if (sqlsrv_execute($stmt) && $row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
            $response = ['status' => 'success', 'snake' => $row];
        } else {
            $response = ['status' => 'error', 'message' => 'Snake not found.'];
        }
    }

    if ($action === 'updateHiScore') {
        $sname = htmlspecialchars(trim($_POST['sname']));  // Snake's name
        $hiscore = intval($_POST['hiscore']);  // The new high score

        // Query to update the snake's high score
        $query = "UPDATE snable SET score = ? WHERE sname = ?";

        // Prepare the query
        $stmt = sqlsrv_prepare($conn, $query, [$hiscore, $sname]);

        if (sqlsrv_execute($stmt)) {
            $response = ['status' => 'success', 'message' => 'High score updated successfully.'];
        } else {
            $response = ['status' => 'error', 'message' => 'Failed to update high score.'];
        }
    }

    if ($action == 'getTopSnakes') {
        // Fetch top 5 snakes from the database (for SQL Server)
        $query = "SELECT TOP 5 sname, score, scolor FROM snable ORDER BY score DESC";
        $stmt = sqlsrv_query($conn, $query);
        
        // Check if the query was successful
        if (!$stmt) {
            // Handle the error (return JSON error message)
            $response = ['status' => 'error', 'message' => 'Query failed: ' . print_r(sqlsrv_errors(), true)];
            echo json_encode($response);
            exit; // Make sure to exit here to stop further processing
        }
    
        // Fetch the results
        $topSnakes = [];
        while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
            $topSnakes[] = $row;
        }
    
        // Send response back to the client
        $response = ['status' => 'success', 'snakes' => $topSnakes];
        echo json_encode($response);
        exit; // Always exit after sending a response
    }

    echo json_encode($response);
    exit;
}
?>