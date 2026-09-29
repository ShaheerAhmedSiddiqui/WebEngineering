<?php

require "db.php";

$sql = "SELECT 
            id,
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
            profile_photo,
            created_at
        FROM alumni
        ORDER BY id DESC";

$result = $conn->query($sql);

?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="style.css">
    <title>Alumni Directory</title>

</head>

<body>

    <div class="container">

        <h1>Alumni Directory</h1>

        <p class="subtitle">
            Registered Alumni Members
        </p>

        <?php if ($result && $result->num_rows > 0): ?>

            <div class="table-container">

                <table>

                    <thead>
                        <tr>
                            <th>Photo</th>
                            <th>ID</th>
                            <th>Full Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Gender</th>
                            <th>Date of Birth</th>
                            <th>Student ID</th>
                            <th>Degree</th>
                            <th>Department</th>
                            <th>Graduation Year</th>
                            <th>Current Job</th>
                            <th>Company</th>
                            <th>City</th>
                            <th>Country</th>
                            <th>Address</th>
                            <th>Registered At</th>
                        </tr>
                    </thead>

                    <tbody>

                        <?php while ($row = $result->fetch_assoc()): ?>

                            <tr>

                                <!-- Profile Photo -->
                                <td>

                                    <?php if (!empty($row["profile_photo"])): ?>

                                        <img
                                            src="<?php echo htmlspecialchars($row["profile_photo"]); ?>"
                                            alt="Profile Photo"
                                            width="60"
                                            height="60"
                                            style="object-fit: cover; border-radius: 50%;"
                                        >

                                    <?php else: ?>

                                        No Photo

                                    <?php endif; ?>

                                </td>

                                <!-- ID -->
                                <td>
                                    <?php echo htmlspecialchars($row["id"]); ?>
                                </td>

                                <!-- Full Name -->
                                <td>
                                    <?php echo htmlspecialchars($row["full_name"]); ?>
                                </td>

                                <!-- Email -->
                                <td>
                                    <?php echo htmlspecialchars($row["email"]); ?>
                                </td>

                                <!-- Phone -->
                                <td>
                                    <?php echo htmlspecialchars($row["phone"]); ?>
                                </td>

                                <!-- Gender -->
                                <td>
                                    <?php echo htmlspecialchars($row["gender"]); ?>
                                </td>

                                <!-- Date of Birth -->
                                <td>
                                    <?php echo htmlspecialchars($row["date_of_birth"]); ?>
                                </td>

                                <!-- Student ID -->
                                <td>
                                    <?php echo htmlspecialchars($row["student_id"]); ?>
                                </td>

                                <!-- Degree -->
                                <td>
                                    <?php echo htmlspecialchars($row["degree"]); ?>
                                </td>

                                <!-- Department -->
                                <td>
                                    <?php echo htmlspecialchars($row["department"]); ?>
                                </td>

                                <!-- Graduation Year -->
                                <td>
                                    <?php echo htmlspecialchars($row["graduation_year"]); ?>
                                </td>

                                <!-- Current Job -->
                                <td>
                                    <?php
                                    echo !empty($row["current_job"])
                                        ? htmlspecialchars($row["current_job"])
                                        : "N/A";
                                    ?>
                                </td>

                                <!-- Company -->
                                <td>
                                    <?php
                                    echo !empty($row["company"])
                                        ? htmlspecialchars($row["company"])
                                        : "N/A";
                                    ?>
                                </td>

                                <!-- City -->
                                <td>
                                    <?php echo htmlspecialchars($row["city"]); ?>
                                </td>

                                <!-- Country -->
                                <td>
                                    <?php echo htmlspecialchars($row["country"]); ?>
                                </td>

                                <!-- Address -->
                                <td>
                                    <?php
                                    echo !empty($row["address"])
                                        ? htmlspecialchars($row["address"])
                                        : "N/A";
                                    ?>
                                </td>

                                <!-- Registration Date -->
                                <td>
                                    <?php echo htmlspecialchars($row["created_at"]); ?>
                                </td>

                            </tr>

                        <?php endwhile; ?>

                    </tbody>

                </table>

            </div>

        <?php else: ?>

            <p>
                No alumni records found.
            </p>

        <?php endif; ?>

        <br>

        <a href="index.html">
            Register New Alumni
        </a>

    </div>

</body>

</html>

<?php

$conn->close();

?>