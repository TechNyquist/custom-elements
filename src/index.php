<?php

    /**
     * This script automates minification of all custom-elements.
     */

    if(!isset($_POST['minify']))
    {
        echo 'Click <form method="POST" style="display: inline"><button type="submit" name="minify">here</button></form> to build all.';
        exit;
    }

    require 'minifier.php';

    function deleteDirectory($dir) {
        if (!file_exists($dir)) {
            return true;
        }
    
        if (!is_dir($dir)) {
            return unlink($dir);
        }
    
        foreach (scandir($dir) as $item) {
            if ($item == '.' || $item == '..') {
                continue;
            }
    
            if (!deleteDirectory($dir . DIRECTORY_SEPARATOR . $item)) {
                return false;
            }
    
        }
    
        return rmdir($dir);
    }

    // ensure root distro path
    $dir = __DIR__;
    $dist = $dir . '/../dist';
    if( is_dir($dist) )
    {
        deleteDirectory($dist);
        if( is_dir($dist) )
            rmdir($dist);
    }
    mkdir($dist);

    // now search for js and css files and minify them
    $lookPath = $dir;
    $distPath = realpath($dist);
    $minifier = new Minifier();

    // returns the amount of found files to minify
    function collectDirectory(Minifier $minifier, string $look_path, string $dist_path): int
    {
        $found = 0;
        $entries = scandir($look_path);
        foreach($entries as $entry)
        {
            if( $entry == '.' || $entry == '..' )
                continue;

            $lpath = $look_path . "/{$entry}";
            if( is_dir($lpath) )
            {
                // ensure dist path
                $dpath = $dist_path . "/{$entry}";
                if( !is_dir($dpath) )
                    mkdir($dpath);
                if( collectDirectory($minifier, $lpath, $dpath) == 0 )
                {
                    // remove dist path if nothing was found inside
                    rmdir($dpath);
                }
            }
            elseif( is_file($lpath) )
            {
                // ignore everything called "index", it's intended only for demo
                if( str_starts_with(basename($lpath), 'index.'))
                    continue;

                $ext = pathinfo($lpath, PATHINFO_EXTENSION);
                $filename = basename($lpath, ".{$ext}");
                $dpath = $dist_path . "/{$filename}.min.{$ext}";

                if( $ext == 'js' )
                {
                    ++$found;
                    $minifier->addJS($lpath, $dpath);
                }
                elseif( $ext == 'css' )
                {
                    ++$found;
                    $minifier->addCSS($lpath, $dpath);
                }
                elseif( $ext == 'html' )
                {
                    ++$found;
                    $minifier->addHtml($lpath, $dpath);
                }
            }
        }
        return $found;
    }

    collectDirectory($minifier, $lookPath, $distPath);

    $minifier->minify();
    echo 'Done.';
