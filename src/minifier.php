<?php

    require_once 'html-css-js-minifier.php';

    /**
     * Wrapper class of html-css-js minification functions.
     */
    class Minifier
    {
        /**
         * Flags used for accessing files arrays
         */
        // source file
        private const SOURCE        = 0;
        // destination of minified file
        private const DESTINATION   = 1;

        /**
         * Array of HTML files to minify.
         * Each entry has its 'source' and 'destination' keys.
         */
        private array $htmlFiles;
        /**
         * Array of CSS files to minify.
         * Each entry has its 'source' and 'destination' keys.
         */
        private array $cssFiles;
        /**
         * Array of JS files to minify.
         * Each entry has its 'source' and 'destination' keys.
         */
        private array $jsFiles;

        public function __construct()
        {
            $this->htmlFiles = array();
            $this->cssFiles = array();
            $this->jsFiles = array();
        }

        /**
         * Add HTML file to minify.
         * 
         * @param string $source Source file.
         * @param string $dest Destination of minified file.
         */
        public function addHtml(string $source, string $dest): void
        {
            $this->htmlFiles[] = [
                self::SOURCE        => $source,
                self::DESTINATION   => $dest
            ];
        }

        /**
         * Add CSS file to minify.
         * 
         * @param string $source Source file.
         * @param string $dest Destination of minified file.
         */
        public function addCSS(string $source, string $dest): void
        {
            $this->cssFiles[] = [
                self::SOURCE        => $source,
                self::DESTINATION   => $dest
            ];
        }

        /**
         * Add JS file to minify.
         * 
         * @param string $source Source file.
         * @param string $dest Destination of minified file.
         */
        public function addJS(string $source, string $dest): void
        {
            $this->jsFiles[] = [
                self::SOURCE        => $source,
                self::DESTINATION   => $dest
            ];
        }

        /**
         * Wipe all added files, ready for a brand new use.
         */
        public function clear(): void
        {
            $this->htmlFiles = array();
            $this->cssFiles = array();
            $this->jsFiles = array();
        }

        /**
         * Execute all added scripts minification according to respective
         * types and destinations.
         */
        public function minify(): void
        {
            for($loop=0; $loop<3; ++$loop)
            {
                $loop_array = match($loop)
                {
                    0 => $this->htmlFiles,
                    1 => $this->cssFiles,
                    2 => $this->jsFiles
                };

                foreach($loop_array as $entry)
                {
                    $input_file = $entry[self::SOURCE];
                    $destination_file = $entry[self::DESTINATION];
    
                    // $buffer->set($destination_file);
                    // $buffer->file->extension = 'min.'.$buffer->file->extension;
    
                    $func = match($loop)
                    {
                        0 => minify_html(...),
                        1 => minify_css(...),
                        2 => minify_js(...)
                    };                
                    file_put_contents($destination_file, $func(file_get_contents($input_file)));
                }
            }
        }
    }
