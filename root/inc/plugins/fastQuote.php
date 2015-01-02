<?php
/**
 * This file is part of View Unread Posts plugin for MyBB.
 * Copyright (C) Lukasz Tkacz <lukasamd@gmail.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */  

/**
 * Disallow direct access to this file for security reasons
 * 
 */
if (!defined("IN_MYBB")) exit;

/**
 * Create plugin object
 * 
 */
$plugins->objects['fastQuote'] = new fastQuote();

/**
 * Standard MyBB info function
 * 
 */
function fastQuote_info()
{
    global $lang;

    $lang->load('fastQuote');

    $lang->fastQuoteDesc = '<form action="https://www.paypal.com/cgi-bin/webscr" method="post" style="float:right;">' .
        '<input type="hidden" name="cmd" value="_s-xclick">' . 
        '<input type="hidden" name="hosted_button_id" value="3BTVZBUG6TMFQ">' .
        '<input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_donate_SM.gif" border="0" name="submit" alt="PayPal - The safer, easier way to pay online!">' .
        '<img alt="" border="0" src="https://www.paypalobjects.com/pl_PL/i/scr/pixel.gif" width="1" height="1">' .
        '</form>' . $lang->fastQuoteDesc;

    return Array(
        'name' => $lang->fastQuoteName,
        'description' => $lang->fastQuoteDesc,
        'website' => 'http://lukasztkacz.com',
        'author' => 'Lukasz "LukasAMD" Tkacz',
        'authorsite' => 'https://tkacz.it',
        'version' => '1.1.0',
        'compatibility' => '18*',
        'codename' => 'fast_quote'
    );
}

/**
 * Standard MyBB installation functions 
 * 
 */
function fastQuote_install()
{
    require_once('fastQuote.settings.php');
    fastQuoteInstaller::install();

    rebuild_settings();
}

function fastQuote_is_installed()
{
    global $mybb;

    return (isset($mybb->settings['fastQuoteStatus']));
}

function fastQuote_uninstall()
{
    require_once('fastQuote.settings.php');
    fastQuoteInstaller::uninstall();

    rebuild_settings();
}

/**
 * Standard MyBB activation functions 
 * 
 */
function fastQuote_activate()
{
    require_once('fastQuote.tpl.php');
    fastQuoteActivator::activate();
}

function fastQuote_deactivate()
{
    require_once('fastQuote.tpl.php');
    fastQuoteActivator::deactivate();
}

/**
 * Plugin Class 
 * 
 */
class fastQuote
{
    private $posts;
    private $quick_reply_status = false;

    /**
     * Constructor - add plugin hooks
     */
    public function __construct()
    {
        global $plugins;

        // Add all hooks
        $plugins->hooks["parse_message_start"][10]["fastQuote_injectParser"] = array("function" => create_function('&$arg', 'global $plugins; $plugins->objects[\'fastQuote\']->injectParser($arg);'));
        $plugins->hooks["postbit"][10]["fastQuote_addButton"] = array("function" => create_function('&$arg', 'global $plugins; $plugins->objects[\'fastQuote\']->addButton($arg);'));
        $plugins->hooks["showthread_start"][10]["fastQuote_checkQuickReplyStatus"] = array("function" => create_function('', 'global $plugins; $plugins->objects[\'fastQuote\']->checkQuickReplyStatus();'));
        $plugins->hooks["pre_output_page"][10]["fastQuote_pluginThanks"] = array("function" => create_function('&$arg', 'global $plugins; $plugins->objects[\'fastQuote\']->pluginThanks($arg);'));
    }
    
    /**
     * Collect post data if full quote option is enabled
     *
     */
    public function injectParser($message)
    {
        global $mybb, $post;
        
        if (THIS_SCRIPT == 'showthread.php' 
            && $mybb->user['uid'] > 0 
            && $mybb->settings['fastQuoteStatus'])
        {
            $this->posts[$post['pid']] = htmlspecialchars($post['message']);
        }
            
        return $message;
    }
    
    /**
     * Check is quick reply enabled
     *
     */
    public function checkQuickReplyStatus()
    {
        global $fid, $forum, $forumpermissions, $mybb, $thread;
        
        if ($forumpermissions['canpostreplys'] != 0 
            && $mybb->user['suspendposting'] != 1 
            && ($thread['closed'] != 1 || is_moderator($fid)) 
            && $mybb->settings['quickreply'] != 0 
            && $mybb->user['showquickreply'] != '0' 
            && $forum['open'] != 0)
        {
            $this->quick_reply_status = true;
        }
	
    }
    
    /**
     * Add fast quote button to post data
     *
     */
    public function addButton(&$post)
    {
        global $lang, $mybb, $templates;

        $post['button_quote_fast'] = '';
        if (!$this->quick_reply_status || !$mybb->settings['fastQuoteStatus'])
        {
            return;
        }
        else
        {
            $fastquote_data = array(
                'pid'           => $post['pid'],
                'username'      => $post['username'],
                'dateline'      => $post['dateline'],
                'title'         => $mybb->settings['fastQuoteText'],
                'style'         => $mybb->settings['fastQuoteImageStyle'],
                'message'       => $this->posts[$post['pid']],
            );
            
            eval("\$post['button_quote_fast'] .= \"" . $templates->get("fastQuote_button") . "\";");
        }
    }
    
    
    /**
     * Say thanks to plugin author - paste link to author website.
     * Please don't remove this code if you didn't make donate
     * It's the only way to say thanks without donate :)     
     */
    public function pluginThanks(&$content)
    {
        global $session, $lukasamd_thanks;
        
        if (!isset($lukasamd_thanks) && $session->is_spider)
        {
            $thx = '<div style="margin:auto; text-align:center;">This forum uses <a href="https://tkacz.it">Lukasz Tkacz</a> MyBB addons.</div></body>';
            $content = str_replace('</body>', $thx, $content);
            $lukasamd_thanks = true;
        }
    }

}
