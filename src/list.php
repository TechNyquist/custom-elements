<h1>Available CustomElements projects</h1>
<ul>
<?php

    $dir = __DIR__.'/';
    $entries = scandir($dir);

    foreach($entries as $entry)
    {
        $path = $dir . $entry;
        if( $entry=='.' || $entry=='..' || !is_dir($path))
            continue;

        echo '<li>', '<a href="'.$entry.'">'.$entry.'</a>', '</li>';
    }
?>
</ul>
