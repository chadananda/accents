# Interminable Accents

### Published to http://chadananda.github.io/accents


### Concept:

Formatting Bahá’í texts is a pain even the best quality electronic texts from the World Center contain thousands of errors. And the most common type of error, are the darned diacritcal marks on all those transliterated terms.

This project attempts to address that fundamental issue by building an authoritative dictionary of correctly spelled terms and names. These can then be used as the basis for automated replacement and suggestion systems.

With modern UTF-8 fonts, we now have accented vowels, open and closed single-quotes and dot-under characters as part of the standard font set. Only the underscore characters are missing and those are usually easily available in formatted displays such as HTML and WYSIWYG editors.


### Get involved, help build the dictionary!

To get involved, simply contact me at <chadananda@gmail.com>. I'll set up user credentials for you which allow you to log in.

Next, pick a book, any Bahá’í book (preferably one that is not already being done.) Start from page one and scan for transliterated terms and type each one in.

As you type, you will notice a filtered list showing how many times matching words have already been entered. If your word in in the list already it is fine to add it again. However, if the word is already in the list 10 times, move on to the next word. We only want to add words enough times to be relatively sure that the word is spelled correctly.



### Simple rules for typeing diacritical marks

* For underscored letters such as <u>sh</u>, <u>th</u>, <u>dh</u> and <u>zh</u> just type an underscore before each two-letter combination -- like "_Sh"

* For accented letters such as á, í, & ú, just type the letter twice to toggle the accent.

* For dot-under letters such as Ḥ, just type a period directly before the letter to be dotted.

* For 'Ayn and Hamza (the single quotes) just type a single quote. Autocorrect will try to get it right automatically. If it does not (such as the word _Shí‘ah) then type the single-quote again to toggle it between open and closed.



### Rules for entering new words

* Type each word with the same capitalization as you see in the book. The only exception is words in all-caps.

* Always give a book reference and page number. Use common three-letter acronymns for this: http://bahai-library.com/abbreviations_bahai_writings

* Enter one word at a time. If the term has multiple words (that is, divided by a space) then just enter one at a time.



------------------------

<br><br><br>
 
------------------------


### Software Development, Next Steps:

1. Continous 2-way sync data with remote CouchDB (it should be like one or two lines of code)
    1.  https://diacritics.iriscouch.com/
    2.  login based on creds giving access to remote db
    3.  successful login saves locally so repeat login unecessary
    4.  'login' link become 'log out' link

1. Validation rules 
    1. both fields are required
    1. only one word on first field (if first field has two words, they are split and added seperately
    1. the second field has the default valut of the previous entry (so you don't always have to add it)
    1. hitting Enter in the first field should submit the form

1. As-you-type search for matching first field
    1. show count of exact matches, 'base' matches and phonetic matches 

1. As-you type show list of 'base' matches directly below  
    2. Move complete list of words to second tab

1. Formatted Content Editable input box

1. Make app resize size to any window

1. Wrap up app in Node-Webkit wrapper for deployment to Mac and Windows (using grunt plugin)
