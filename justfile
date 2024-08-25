default:

download_words:
    @curl -s https://raw.githubusercontent.com/dwyl/english-words/master/words_alpha.txt | tr -d '\r' > words.txt
