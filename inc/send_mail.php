<?php
    if(isset($_REQUEST["username"]) && isset($_REQUEST["email"]) && isset($_REQUEST["subject"]) && isset($_REQUEST["text"])) {
        $username = $_REQUEST["username"];
        $email = $_REQUEST["email"];
        $subject = $_REQUEST["subject"];
        $text = $_REQUEST["text"];

        date_default_timezone_set('Etc/UTC');
		// Edit this path if PHPMailer is in a different location.
		require './PHPMailer/PHPMailerAutoload.php';
		
		$mail = new PHPMailer;
		$mail->isSMTP();
		
		/*
		* Server Configuration
		*/
		
		$mail->Host = 'smtp.gmail.com'; // Which SMTP server to use.
		$mail->Port = 587; // Which port to use, 587 is the default port for TLS security.
		$mail->SMTPSecure = 'tls'; // Which security method to use. TLS is most secure.
		$mail->SMTPAuth = true; // Whether you need to login. This is almost always required.
		$mail->Username = ""; // Your Gmail address.
		$mail->Password = ""; // Your Gmail login password or App Specific Password.

		$mail->setFrom($email, $username . ''); // Set the sender of the message.
		$mail->addAddress('', ''); // Set the recipient of the message.
		$mail->Subject = $subject; // The subject of the message.

		// Choose to send either a simple text email...
		$mail->Body = $text; // Set a plain text body.
		
		// ... or send an email with HTML.
		//$mail->msgHTML();
		// Optional when using HTML: Set an alternative plain text message for email clients who prefer that.
		//$mail->AltBody = 'This is a plain-text message body'; 
		//$mail->addAttachment('images/phpmailer_mini.png');
        if($mail->send())
            echo '';
        else
            echo '{"error":"There was an error when sending the email."}';
    }
    else
        echo '{"error":"Unset username, email, subject or text."}';
?>