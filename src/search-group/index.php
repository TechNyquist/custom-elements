<!DOCTYPE html>
<html>
    <head>
        <title>search-group</title>
        <meta charset="utf-8">
        <script type="module" src="./ce-search-group.js"></script>
        <script type="module" src="./index.js"></script>
        <link type="text/css" rel="stylesheet" href="./index.css" />
    </head>
    <body>

        <div id="inputs">
            <div><input type="text" name="fruit" placeholder="Type a fruit" /></div>
            <div><input type="text" name="age" placeholder="Type a age" /></div>
            <div><input type="text" name="city" placeholder="Type a city" /></div>
        </div>

        <h1>Local search</h1>

        <search-group id="local">
            <search-group-target selector="#inputs input" />
        </search-group>

        <div id="list">
            <?php
                $list = include 'list.php';
                foreach($list as $entry): ?>
            <div>
                <div class="fruit"><?= $entry['fruit'] ?></div>
                <div class="age"><?= $entry['age'] ?></div>
                <div class="city"><?= $entry['city'] ?></div>
            </div>
            <?php endforeach; ?>
        </div>
        <div id="local-output"></div>

        <h1>Remote search</h1>

        <search-group id="remote" remote="ajax.php" rtype="form">
            <search-group-target selector="#inputs input" />
        </search-group>

        <div id="remote-output"></div>
    </body>
</html>