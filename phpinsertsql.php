<?php
    include 'phpconnect.php';
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        try{
            //Your SQL query here
            $sname = $_POST["sname"];
            $scolor = $_POST["scolor"];

            $sql = "INSERT INTO snake_table (sname, scolor)
                    VALUES ('".$sname."', '".$scolor."')";

            $stmt = sqlsrv_query( $conn, $sql);
            if( $stmt === false ) {
                die( print_r(sqlsrv_errors(), true));
            }
            
            sqlsrv_close($conn);
        }
        catch(Exception $e){
            echo "Error: " . $e->getMessage();
        }
    }
?>