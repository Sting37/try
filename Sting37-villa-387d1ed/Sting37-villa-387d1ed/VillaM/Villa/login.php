<?php
session_start();
?>
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <title>Login</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/css/bootstrap.min.css">
    <link rel="stylesheet" href="css/main.css">
</head>
<body class="bg-login">

<div class="container">
    <div class="row justify-content-center align-items-center" style="min-height: 100vh;">
        <div class="col-md-5">
            <div class="card login-card shadow-lg">
                <div class="card-header login-header">
                    <h3 class="mb-0">Login</h3>
                </div>
                <div class="card-body">
                    <?php if (isset($_SESSION['login_error'])): ?>
                        <div class="alert alert-danger">
                            <?php
                                echo $_SESSION['login_error'];
                                unset($_SESSION['login_error']);
                            ?>
                        </div>
                    <?php endif; ?>
                    <form action="authenticate.php" method="post" autocomplete="off">
                        <div class="form-group">
                            <label for="email"><strong>Email <span class="text-danger">*</span></strong></label>
                            <input type="email" class="form-control" id="email" name="email" required autofocus>
                        </div>
                        <div class="form-group">
                            <label for="password"><strong>Password <span class="text-danger">*</span></strong></label>
                            <input type="password" class="form-control" id="password" name="password" required>
                        </div>
                        <button type="submit" class="btn btn-login btn-block">Login</button>
                    </form>
                    <div class="mt-3 text-center">
                        <span>Not registered?</span>
                        <a href="register.php" class="login-link">Register here.</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

</body>
</html>