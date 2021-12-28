<?php
    if(isset($_REQUEST["pwd"]) && $_REQUEST["pwd"] !== '')
        echo md5($_REQUEST["pwd"]);
    else
        echo '';
?>