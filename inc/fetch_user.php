<?php
    if(isset($_REQUEST["type"]) && isset($_REQUEST["val"])) {
        $type = $_REQUEST["type"];
        $val = $_REQUEST["val"];
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

        $qry = "SELECT * FROM db WHERE " . $type . " = '" . $val . "' LIMIT 1";
        $result = $db->query($qry);
        if($result->num_rows == false)
            echo '{"error":"User with '.$type.' \''.$val.'\' not found."}';
        else
            echo json_encode($result->fetch_assoc());
    }
    else
        echo '{"error":"Unset type or value to fetch."}';
?>