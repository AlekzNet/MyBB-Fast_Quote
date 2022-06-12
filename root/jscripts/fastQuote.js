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
 
/* All code from phpBB3 SEO Premod, based on GPLv2 License */ 
function initInsertions() 
{
	var doc;

	if (document.forms[form_name])
	{
		doc = document;
	}
	else 
	{
		doc = opener.document;
	}

	var textarea = doc.forms[form_name].elements[text_name];
	if (is_ie && typeof(baseHeight) != 'number')
	{	
        setTimeout(function() { textarea.focus(); }, 10);
		baseHeight = doc.selection.createRange().duplicate().boundingHeight;

		if (!document.forms[form_name])
		{
            setTimeout(function() { document.body.focus(); }, 10);
		}
	}
}

/**
* Insert text at position
*/
function insert_text(text, spaces, popup)
{
	var textarea;
	
	if (!popup) 
	{
		textarea = document.forms[form_name].elements[text_name];
	} 
	else 
	{
		textarea = opener.document.forms[form_name].elements[text_name];
	}
	if (spaces) 
	{
		text = ' ' + text + ' ';
	}
	
	if (!isNaN(textarea.selectionStart))
	{
		var sel_start = textarea.selectionStart;
		var sel_end = textarea.selectionEnd;

		mozWrap(textarea, text, '');
		textarea.selectionStart = sel_start + text.length;
		textarea.selectionEnd = sel_end + text.length;
	}	
	
	else if (textarea.createTextRange && textarea.caretPos)
	{
		if (baseHeight != textarea.caretPos.boundingHeight) 
		{
            setTimeout(function() { textarea.focus(); }, 10);
			storeCaret(textarea);
		}		
		var caret_pos = textarea.caretPos;
		caret_pos.text = caret_pos.text.charAt(caret_pos.text.length - 1) == ' ' ? caret_pos.text + text + ' ' : caret_pos.text + text;
		
	}
	else
	{
		textarea.value = textarea.value + text;
	}
	if (!popup) 
	{
        setTimeout(function() { textarea.focus(); }, 10);
	} 	

}



// Startup variables
var imageTag = false;
var theSelection = false;
var bbcodeEnabled = true;

// Check for Browser & Platform for PC & IE specific bits
// More details from: http://www.mozilla.org/docs/web-developer/sniffer/browser_type.html
var clientPC = navigator.userAgent.toLowerCase(); // Get client info
var clientVer = parseInt(navigator.appVersion); // Get browser version

var is_ie = ((clientPC.indexOf('msie') != -1) && (clientPC.indexOf('opera') == -1));
var is_win = ((clientPC.indexOf('win') != -1) || (clientPC.indexOf('16bit') != -1));

function addquote(post_id, post_time, username, l_wrote)
{
	var message_name = 'message_fq' + post_id;
	var theSelection = '';
	var divarea = false;

	if (l_wrote === undefined)
	{
		// Backwards compatibility
		l_wrote = 'wrote';
	}

	if (document.all)
	{
		divarea = document.all[message_name];
	}
	else
	{
		divarea = document.getElementById(message_name);
	}

	// Get text selection - not only the post content :(
	
		var selectionObject = false;
		var theSelectionText = "";
		if (window.getSelection) {
			selectionObject = window.getSelection();
			if(selectionObject.getRangeAt) {
				theSelection = selectionObject.getRangeAt(0).cloneContents();
				theSelectionText = theSelection.toString();
			} else {
				theSelection = document.createRange();
				theSelection.setStart(selectionObject.anchorNode,selectionObject.anchorOffset);
				theSelection.setEnd(selectionObject.focusNode, selectionObject.focusOffset);
				theSelectionText = theSelection.toString();
			}

		}
		else if (document.selection) {
			selectionObject = document.selection.createRange();
			theSelection = document.createElement("DIV");
			theSelection.innerHTML = selectionObject.htmlText;
			theSelectionText = selectionObject.text;
		}
		else {
			userSelection = false;
		}


	if (theSelection) {
		theSelection = domToBB(theSelection);
	}




	if (theSelection == '' || typeof theSelection == 'undefined' || theSelection == null)
	{
		if (divarea.innerHTML)
		{
			theSelection = divarea.innerHTML.replace(/<br>/ig, '\n');
			theSelection = theSelection.replace(/<br\/>/ig, '\n');
			theSelection = theSelection.replace(/&lt\;/ig, '<');
			theSelection = theSelection.replace(/&gt\;/ig, '>');
			theSelection = theSelection.replace(/&amp\;/ig, '&');
			theSelection = theSelection.replace(/&nbsp\;/ig, ' ');
		}
		else if (document.all)
		{
			theSelection = divarea.innerText;
		}
		else if (divarea.textContent)
		{
			theSelection = divarea.textContent;
		}
		else if (divarea.firstChild.nodeValue)
		{
			theSelection = divarea.firstChild.nodeValue;
		}
	}

	if (theSelection)
	{
		if (bbcodeEnabled)
		{
			insert_text('[quote="' + username + '" pid="' + post_id + '" dateline="' + post_time + '"]' + theSelection + '[/quote]\n');
		}
		else
		{
			insert_text(username + ' ' + l_wrote + ':' + '\n');
			var lines = split_lines(theSelection);
			for (i = 0; i < lines.length; i++)
			{
				insert_text('> ' + lines[i] + '\n');
			}
		}
	}
	
	return;
}


/**
* From http://www.massless.org/mozedit/
*/
function mozWrap(txtarea, open, close)
{
	var selLength = (typeof(txtarea.textLength) == 'undefined') ? txtarea.value.length : txtarea.textLength;
	var selStart = txtarea.selectionStart;
	var selEnd = txtarea.selectionEnd;
	var scrollTop = txtarea.scrollTop;

	if (selEnd == 1 || selEnd == 2) 
	{
		selEnd = selLength;
	}

	var s1 = (txtarea.value).substring(0,selStart);
	var s2 = (txtarea.value).substring(selStart, selEnd);
	var s3 = (txtarea.value).substring(selEnd, selLength);

	txtarea.value = s1 + open + s2 + close + s3;
	txtarea.selectionStart = selStart + open.length;
	txtarea.selectionEnd = selEnd + open.length;
    setTimeout(function() { txtarea.focus(); }, 10);
	txtarea.scrollTop = scrollTop;

	return;
}

function domToBB(domEl)
{
	var output = "";
	var childNode;
	var openTag;
	var content;
	var closeTag;
				
	for(var i = 0 ; i < domEl.childNodes.length ; i++)
	{	
		childNode = domEl.childNodes[i];
		openTag = "";
		content = "";
		closeTag = "";
					
		if(typeof childNode.tagName == "undefined")
		{
			switch(childNode.nodeName)
			{
				case '#text':
					output += childNode.data.replace(/[\n\t]+/,'');
				break;
				default:
					// do nothing
				break;
				
			}
		}
		else
		{
			switch(childNode.tagName)
			{
				case "SPAN":
					// check style attributes
					switch(true)
					{
						case childNode.style.textDecoration == "underline":
							openTag = "[u]";
							closeTag = "[/u]";
							break;
						case childNode.style.fontWeight > 0:
						case childNode.style.fontWeight == "bold":
							openTag = "[b]";
							closeTag = "[/b]";
							break;
						case childNode.style.fontStyle == "italic":
							openTag = "[i]";
							closeTag = "[/i]";
							break;
						case childNode.style.fontFamily != "":
							openTag = "[font=" + childNode.style.fontFamily + "]";
							closeTag = "[/font]";
							break;
						case childNode.style.fontSize != "":
							openTag = "[size=" + childNode.style.fontSize + "]";
							closeTag = "[/size]";
							break;
						case childNode.style.color != "":
							if(childNode.style.color.indexOf('rgb') != -1)
							{
								var rgb = childNode.style.color.replace("rgb(","").replace(")","").split(",");
								var hex = "#"+ RGBtoHex(parseInt(rgb[0]) , parseInt(rgb[1]) , parseInt(rgb[2]));
							}
							else
							{
								var hex = childNode.style.color;
							}
							openTag = "[color=" + hex + "]";
							closeTag = "[/color]";
							break;
					}
					break;
				case "STRONG":
				case "B":
					openTag = "[b]";
					closeTag = "[/b]";
					break;
				case "EM":
				case "I":
					openTag = "[i]";
					closeTag = "[/i]";
					break;
				case "U":
					openTag = "[u]";
					closeTag = "[/u]";
					break;
				case "IMG":
						openTag ="[img]";
						content = childNode.src;
						closeTag = "[/img]";
					break;
				case "A":
					switch(true)
					{
						case childNode.href.indexOf("mailto:") == 0:
							openTag = "[email=" + childNode.href.replace("mailto:","") + "]";
							closeTag = "[/email]";
						break;
						default:
							openTag = "[url=" + childNode.href + "]";
							closeTag = "[/url]";
						break;
					}
					break;
				case "OL":
					openTag = "[list=" + childNode.type + "]";
					closeTag = "\n[/list]";
					break;
				case "UL":
					openTag = "[list]";
					closeTag = "\n[/list]";
					break;
				case "LI":
					openTag = "\n[*]";
					closeTag = "";
					break;
				case "BLOCKQUOTE":
					childNode.removeChild(childNode.firstChild);
					openTag = "[quote]\n";
					closeTag = "\n[/quote]";
					break;
				case "DIV":
					if(childNode.style.textAlign)
					{
						openTag = "[align="+childNode.style.textAlign+"]\n";
						closeTag = "\n[/align]\n";
					}
					
					switch(childNode.className)
					{
						case "codeblock":
							openTag = "[code]\n";
							closeTag = "\n[/code]";
							childNode.removeChild(childNode.getElementsByTagName("div")[0]);
							break;
						case "codeblock phpcodeblock":
							var codeTag = childNode.getElementsByTagName("code")[0];
							childNode.removeChild(childNode.getElementsByTagName("div")[0]);
							openTag = "[php]\n";
							if(codeTag.innerText)
							{
								content = codeTag.innerText;
							}
							else
							{
								//content = codeTag.textContent;
								content = codeTag.innerHTML.replace(/<br([^>]*)>/gi,"\n").replace(/<([^<]+)>/gi,'').replace(/&nbsp;/gi,' ');
							}
							closeTag = "\n[/php]";
							break;
					}
					break;
				case "P":
						closeTag = "\n\n";
					break;
				case "BR":
						closeTag = "\n"
					break;
			}
						
			output += openTag + content;
						
			if(content == "" && childNode.childNodes && childNode.childNodes.length > 0)
			{
				output += domToBB(childNode);
			}
						
			output += closeTag;
		}
	}
				
	return output;
}

function RGBtoHex (R,G,B) {return toHex(R)+ toHex(G)+ toHex(B)}

function toHex (N)
{
	if (N==null) return "00";
	N=parseInt(N); if (N==0 || isNaN(N)) return "00";
	N=Math.max(0,N); N=Math.min(N,255); N=Math.round(N);
	return "0123456789ABCDEF".charAt((N-N%16)/16)
			+ "0123456789ABCDEF".charAt(N%16);
}
