<?php

$name = $email = $selectedProduct = $represent = $deadline = '';

if ($_SERVER["REQUEST_METHOD"] != "POST") {
  exit( 'Wrong request' );
}

$name = test_input( $_POST["name"] );
if ( $name == '' ) {
  exit( 'Name is required' );
}

// if ( ! preg_match("/^[a-zA-Z ]*$/", $name)) {
if ( ! preg_match('/^[a-zA-Z \p{Cyrillic}]+$/u', $name)) {
  exit( "Only letters and white space allowed" );
}

$email = test_input( $_POST["email"] );
if ( $email == '' ) {
  exit( 'Email is required' );
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  exit( "Invalid email format" );
}

$selectedProduct = test_input( $_POST['selectedProduct'] );
$represent = test_input( $_POST['represent'] );
$deadline = test_input( $_POST['deadline'] );

$to = 'volodymyr.kryvonos@gmail.com';
$from = "info@thenotes.top";
$subjectText = "Заявка від клієнта";
$subject = "=?UTF-8?B?".base64_encode($subjectText)."?=";

$headers   = array();
$headers[] = "MIME-Version: 1.0";
$headers[] = "Content-type: text/html; charset=UTF-8";
$headers[] = "From: Redvike <$from>";
$headers[] = "Reply-To: Redvike <$from>";
$headers[] = "X-Mailer: PHP/".phpversion();


$message  = "<html><body>";
$message .= "<table rules=\"all\" style=\"border-color: #666;\" cellpadding=\"10\">";
$message .=    "<tr>";
$message .=       "<td><strong>Client name:</strong></td><td>". $name ."</td>";
$message .=    "</tr>";
$message .=    "<tr>";
$message .=       "<td><strong>Email:</strong></td><td>". $email ."</td>";
$message .=    "</tr>";
$message .=    "<tr>";
$message .=       "<td><strong>Selected product:</strong></td><td>". $selectedProduct ."</td>";
$message .=    "</tr>";
$message .=    "<tr>";
$message .=       "<td><strong>Represent:</strong></td><td>". $represent ."</td>";
$message .=    "</tr>";
$message .=    "<tr>";
$message .=       "<td><strong>Deadline:</strong></td><td>". $deadline ."</td>";
$message .=    "</tr>";
$message .= "</table";
$message .= "</body></html>";

$retval = mail($to, $subject, $message, implode("\r\n", $headers));

echo $retval;


function test_input($data) {
  $data = trim($data);
  $data = stripslashes($data);
  $data = htmlspecialchars($data);

  return $data;
}
?>
