<?php
    if(isset($_REQUEST["username"]) && isset($_REQUEST["password"]) && isset($_REQUEST["email"])) {
        $username = $_REQUEST["username"];
        $password = $_REQUEST["password"];
        $email = $_REQUEST["email"];

        $DB_SERVER = '';
        $DB_USERNAME = '';
        $DB_PASSWORD = '';
        $DB_DATABASE = '';

        mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
        try
        {
            $db = new mysqli($DB_SERVER, $DB_USERNAME, $DB_PASSWORD, $DB_DATABASE);

            if($db->connect_error) {
                echo '{"error":"Error connecting to mysql db."}';
            }
            $db->set_charset("utf8mb4");
        }
        catch(Exeption $e) {
            echo '{"error":"Error connecting to mysql db."}';
        }

        $qry = "INSERT INTO db (`username`, `password`, `email`) VALUES ('$username', '$password', '$email')";
        if($db->query($qry) === TRUE)
            echo '';
        else
            echo '{"error":"Error inserting data into mysql table."}';
    }
    else
        echo '{"error":"Unset username, password or email."}';
?>