```php
<?php

require "db.php";

/*
 * Make sure the form was submitted using POST.
 */
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    die("Invalid request.");
}


/*
 * Receive form data.
 */
$full_name = trim($_POST["full_name"] ?? "");
$email = trim($_POST["email"] ?? "");
$phone = trim($_POST["phone"] ?? "");
$gender = trim($_POST["gender"] ?? "");
$date_of_birth = trim($_POST["date_of_birth"] ?? "");

$student_id = trim($_POST["student_id"] ?? "");
$degree = trim($_POST["degree"] ?? "");
$department = trim($_POST["department"] ?? "");
$graduation_year = trim($_POST["graduation_year"] ?? "");

$current_job = trim($_POST["current_job"] ?? "");
$company = trim($_POST["company"] ?? "");

$city = trim($_POST["city"] ?? "");
$country = trim($_POST["country"] ?? "");
$address = trim($_POST["address"] ?? "");

$password = $_POST["password"] ?? "";

$profile_photo = "";


/*
 * Basic validation.
 */
if (
    empty($full_name) ||
    empty($email) ||
    empty($phone) ||
    empty($gender) ||
    empty($date_of_birth) ||
    empty($student_id) ||
    empty($degree) ||
    empty($department) ||
    empty($graduation_year) ||
    empty($city) ||
    empty($country) ||
    empty($password)
) {
    die("Please fill in all required fields.");
}


/*
 * Validate email.
 */
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    die("Please enter a valid email address.");
}


/*
 * Check whether email already exists.
 */
$check = $conn->prepare(
    "SELECT id FROM alumni WHERE email = ?"
);

$check->bind_param("s", $email);

$check->execute();

$check->store_result();

if ($check->num_rows > 0) {
    $check->close();
    $conn->close();

    die("This email address is already registered.");
}

$check->close();


/*
 * Handle profile photo upload.
 */
if (
    isset($_FILES["profile_photo"]) &&
    $_FILES["profile_photo"]["error"] !== UPLOAD_ERR_NO_FILE
) {

    /*
     * Check for upload errors.
     */
    if ($_FILES["profile_photo"]["error"] !== UPLOAD_ERR_OK) {
        die("There was an error uploading the profile photo.");
    }


    /*
     * Maximum file size: 2 MB.
     */
    $max_size = 2 * 1024 * 1024;

    if ($_FILES["profile_photo"]["size"] > $max_size) {
        die("Profile photo must be smaller than 2 MB.");
    }


    /*
     * Allowed image types.
     */
    $allowed_types = [
        "image/jpeg" => "jpg",
        "image/png" => "png",
        "image/webp" => "webp"
    ];


    /*
     * Check the actual MIME type.
     */
    $file_type = mime_content_type(
        $_FILES["profile_photo"]["tmp_name"]
    );


    if (!array_key_exists($file_type, $allowed_types)) {
        die("Only JPG, PNG and WEBP images are allowed.");
    }


    /*
     * Get the correct extension.
     */
    $extension = $allowed_types[$file_type];


    /*
     * Generate a unique filename.
     */
    $file_name = uniqid("profile_", true) . "." . $extension;


    /*
     * Upload directory.
     */
    $upload_directory = __DIR__ . "/uploads/";


    /*
     * Complete file path.
     */
    $upload_path = $upload_directory . $file_name;


    /*
     * Move uploaded file into uploads folder.
     */
    if (!move_uploaded_file(
        $_FILES["profile_photo"]["tmp_name"],
        $upload_path
    )) {
        die("Failed to save the profile photo.");
    }


    /*
     * Store relative path in database.
     */
    $profile_photo = "uploads/" . $file_name;
}


/*
 * Securely hash the password.
 */
$password_hash = password_hash(
    $password,
    PASSWORD_DEFAULT
);


/*
 * Insert alumni record.
 */
$sql = "INSERT INTO alumni (
    full_name,
    email,
    phone,
    gender,
    date_of_birth,
    student_id,
    degree,
    department,
    graduation_year,
    current_job,
    company,
    city,
    country,
    address,
    password,
    profile_photo
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";


$stmt = $conn->prepare($sql);


/*
 * Convert graduation year to integer.
 */
$graduation_year = (int) $graduation_year;


/*
 * Bind values.
 */
$stmt->bind_param(
    "ssssssssisssssss",
    $full_name,
    $email,
    $phone,
    $gender,
    $date_of_birth,
    $student_id,
    $degree,
    $department,
    $graduation_year,
    $current_job,
    $company,
    $city,
    $country,
    $address,
    $password_hash,
    $profile_photo
);


/*
 * Execute INSERT query.
 */
if ($stmt->execute()) {

    echo "<!DOCTYPE html>";

    echo "<html>";

    echo "<head>";

    echo "<title>Registration Successful</title>";

    echo "<link rel='stylesheet' href='style.css'>";

    echo "</head>";

    echo "<body>";

    echo "<div class='container'>";

    echo "<div class='form-card'>";

    echo "<div class='header'>";

    echo "<h1>Registration Successful!</h1>";

    echo "<p>Welcome to the Alumni Community.</p>";

    echo "</div>";

    echo "<p>Your alumni record has been successfully saved.</p>";

    if ($profile_photo !== "") {

        echo "<br>";

        echo "<p><strong>Profile photo uploaded successfully.</strong></p>";

    }

    echo "<br>";

    echo "<a href='index.html'>Register Another Alumni</a>";

    echo "<br><br>";

    echo "<a href='alumini.php'>View Alumni Directory</a>";

    echo "</div>";

    echo "</div>";

    echo "</body>";

    echo "</html>";

} else {

    echo "Registration failed: " . $stmt->error;
}


/*
 * Close resources.
 */
$stmt->close();

$conn->close();

?>
```
