<?php
require 'phpconnect.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $action = $_POST['action'];
    $response = ['status' => 'error', 'message' => 'Invalid action'];

    if ($action === 'saveSnake') {
        $sname = htmlspecialchars(trim($_POST['sname']));
        $scolor = htmlspecialchars(trim($_POST['scolor']));
        $score = intval($_POST['score']);

        // Insert or update snake in database
        $query = "INSERT INTO snake_table (sname, scolor, score) 
                  VALUES (?, ?, ?)
                  ON DUPLICATE KEY UPDATE scolor = VALUES(scolor), score = GREATEST(score, VALUES(score))";

        $stmt = sqlsrv_prepare($conn, $query, [$sname, $scolor, $score]);
        if (sqlsrv_execute($stmt)) {
            $response = ['status' => 'success', 'message' => "$sname saved successfully!"];
        } else {
            $response['message'] = 'Database error: ' . print_r(sqlsrv_errors(), true);
        }
    }

    if ($action === 'getSnake') {
        $sname = htmlspecialchars(trim($_POST['sname']));
        $query = "SELECT sname, scolor, score FROM snake_table WHERE sname = ?";
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
        $query = "UPDATE snake_table SET score = ? WHERE sname = ?";

        // Prepare the query
        $stmt = sqlsrv_prepare($conn, $query, [$hiscore, $sname]);

        if (sqlsrv_execute($stmt)) {
            $response = (['status' => 'success', 'message' => 'High score updated successfully.']);
        } else {
            $response = (['status' => 'error', 'message' => 'Failed to update high score.']);
        }
    }

    echo json_encode($response);
    exit;
}
?>