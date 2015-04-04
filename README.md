# Interminable Accents

## http://chadananda.github.io/accents

### https://www.youtube.com/watch?v=AuoAnqVRUCI

[[http://content.screencast.com/users/chadananda/folders/Jing/media/898cce0f-4105-42ae-97cc-af4fdba8bd92/00000490.png | width = 250px]]

<a href="https://www.youtube.com/watch?v=AuoAnqVRUCI"><img src="http://content.screencast.com/users/chadananda/folders/Jing/media/898cce0f-4105-42ae-97cc-af4fdba8bd92/00000490.png" align="center" width="250" ></a>


### The big idea:

Formatting Bahá’í electronic texts is a pain. Even the best quality electronic texts from the World Center contain thousands of errors. And by far the most common type of error is the darned diacritcals on all those transliterated Arabic and Persian terms.

This project attempts to address that fundamental problem by building an authoritative dictionary of correctly spelled terms and names. These can then be used as the basis for automated replacement and suggestion systems.

With modern UTF-8 fonts, we now have accented vowels, open and closed single-quotes and dot-under characters as part of the standard font set. Only the underscore characters are missing and those are usually easily available in formatted displays such as HTML and WYSIWYG editors.



### Get involved, help build the dictionary!

To get involved, simply contact me at <chadananda@gmail.com>. I'll set up user credentials for you which allow you to log in and start adding words to the dictionary.

Next, pick any Bahá’í book (preferably one that is not already being worked on.) Start from page one and scan each page for transliterated terms and then type each one in. There is no easy way to this but the more volunteer fingers, the better.

As you type, you will notice a filtered list showing how many times matching words have already been entered. If your word is in the list already it is fine to add it again. However, if the word is already in the list 10 times, move on to the next word. We only want to add words enough times to be relatively sure that the word is spelled correctly.



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


### Software Development, TODO:

1. Speed up main term list 
    2. Make it a vertical scrolling paginated view
    2. Possibly ordered by first alphabet letter 
    3. Still sorted by "base" version

1. Improve as-you-type filtering
    1. show complete match at top of list (sometimes the perfect match is short and therefore buried)
    2. only start matching on >3 letters
    3. when typing, pause 2 seconds (naggle) on filter match to not seize typing
    4. keep hash list of fragment bases to spell check individually typed fragments (between dashes and apostrophes)

1. Add "Correction" page
   1. Integrate diacriticals project
   2. Provide paste box for pasting in large blocks of HTML/text
   3. Provide filter options
   3. Provide view iFrame to see results
   4. Provide download button to pull down changed document

1. Add Conflict Report tab to first page or as additional 'app'
   1. show list of words with conflicted spellings
   2. show individual items and allow deletion 

1. Debugging
   1. Debug Javascript communications errors
   2. Speed up batch data synchronization
   3. Remember highest page number provided even after logout/login
   3. Show some visual indication of data synchronizing or offline mode 
   4. Smooth offline operation
   4. Login  
      1. hitting Enter in the first field should submit the form
      2. should load faster after logging in.

1. Make app resize size to any window
   2. add vertical scroll bar for list
   3. horizontal resize

1. Wrap up app in Node-Webkit wrapper for deployment to Mac and Windows (using grunt plugin)

1. Use 'erica' library to store all files in a database 
   1. URL pulls down loader stub which copies app to local files ?? (possible for node webkit version?)
   2. Background process updates app from synced DB
   3. Grunt or GitHub task pushes new changes to deploy DB





