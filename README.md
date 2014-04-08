accents
=======

Transliterated terminology collection and auto-replace project

### Next Steps:

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



