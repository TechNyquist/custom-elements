<?php

    /**
     * Simple example of search through the same list of FE.
     * 
     * @author Niki Romagnoli <niki.r@technyquist.com>
     */

    $list = include 'list.php';

    $matches = [];
    foreach($list as $entry)
    {
        $getIt = true;

        foreach($entry as $name=>$value)
        {
            $crit = $_POST[$name] ?? null;
            if( is_null($crit) )
                continue;

            if( stripos($value, $crit) === false )
            {
                $getIt = false;
                break;
            }
        }

        if($getIt)
            $matches[] = $entry;
    }

    echo json_encode($matches);
