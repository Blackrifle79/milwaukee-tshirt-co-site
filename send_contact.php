<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {

    // Sanitize input
    $name = strip_tags(trim($_POST["name"]));
    $email = filter_var(trim($_POST["email"]), FILTER_SANITIZE_EMAIL);
    $message = strip_tags(trim($_POST["message"]));

    // Validate
    if (empty($name) || empty($email) || empty($message)) {
        die("Form incomplete.");
    }

    $to = "info@milwaukeetshirtco.com";  // YOUR email
    $subject = "New Contact Form Submission";

    $body = "New contact form submission:\n\n";
    $body .= "Name: $name\n";
    $body .= "Email: $email\n\n";
    $body .= "Message:\n$message\n";

    $headers = "From: $email\r\n";
    $headers .= "Reply-To: $email\r\n";

    // Send the message
    mail($to, $subject, $body, $headers);

    // Redirect user
    header("Location: contact_thanks.html");
    exit();
}
?>
