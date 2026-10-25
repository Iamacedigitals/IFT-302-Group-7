<?php
// Ends the server-side session and returns to login.
// assets/js/app.js clears the demo login (localStorage) before this page loads.
session_start();
$_SESSION = [];
session_destroy();
header('Location: login.php');
exit;
