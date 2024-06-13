*Смотрите ниже русский вариант инструкции* 

Hello! My name is Zholdas Aldanbergen. 

The script was written by me. Overall, script is vizualizing the data structure in hierarchy tree. There are 2 scripts. 1st script "htmltojson.js" - this script translates the given html file, which was taken from confluence, translates the data to JSON(data.json) automatically. The core thing is the format that is given in html file. It is important to have the same structure as in HTML files attached to this folder(ecd.html, eminfin.html, isgb.html). 

!!! If you have a new file that you want to implement to this script: 
1. Save the file in the same repository just like other HTML files. 
2. As in line 70 in "htmltojson.js", copy and paste to the next line, like: 
"const data3 = extractDataFromHtml(loadHtmlContent('NAME_OF_YOUR_FILE.html'));"

--> data3 make a new data variable(data 4 or more) 

3. If you want to place this implemented html file from the left side of main node, you should do the same algorithm as before. Copy the line 73 --> "addPositionLeftToAllNodes(YOUR_DATA_VARIABLE);" and paste it to the next line.

4. The last thing that you should do, is to add the new data variable of your new html file to the line 79 --> "children: [data1, data2, data3, YOUR_DATA_VARIABLE]"

If you want to replace the existing file with a new one, just replace the old file with a new one in the repository and check if the names are the same in "htmltojson.js"

!Finally, just run the "htmltojson.js" and everything automatically will be exported to a data.json!

- I wrote comments in English to every function and important places in the code. Please check before you change something in the code. 

That's it! Hope that you coped with this simple algorithm:) 

P.S If after clicking the node all pathes appeared, click the "Reset button" and wait little bit of time, so the program is processing slow, and it can take 5-6 seconds to parse all information. It also depends on the amount of data in data.json. The more data in data.json, the more processes should be done to those data. 
_______________________________________________________________________________________


Привет! Меня зовут Жолдас Алданберген.

Скрипт был написан мной. В целом скрипт визуализирует структуру данных в иерархическом древе. Есть 2 скрипта. 1-й скрипт "htmltojson.js" - этот скрипт переводит с данные html файла, который был взят из confluence, автоматически переводит на JSON(data.json). Главное — это формат, заданный в html-файле. Важно иметь ту же структуру, что и HTML-файлы, прикрепленные к этой папке (ecd.html, eminfin.html, isgb.html).

!!! Если у вас есть новый файл, который вы хотите внедрить в этом скрипте:
1. Сохраните файл в том же репозитории, что и другие файлы HTML.
2. Как и в строке 70 в «htmltojson.js», скопируйте и вставьте в следующую строку, например:
"const data3 = ExtractDataFromHtml(loadHtmlContent('НАЗВАНИЕ_ВАШЕГО_ФАЙЛА.html'));"

--> data3 создать новую переменную данных (data.4 или более)

3. Если вы хотите разместить этот внедрённый html-файл с левой стороны основного узла, вам следует выполнить тот же алгоритм, что и раньше. Скопируйте строку 73 -> «addPositionLeftToAllNodes(НАЗВАНИЕ_ПЕРЕМЕННОЙ);» и вставьте его в следующую строку.

4. Последнее, что вам нужно сделать, это добавить новую переменную данных вашего нового html-файла в строку 79 -> «дети: [data1, data2, data3, НАЗВАНИЕ_ПЕРЕМЕННОЙ]»

Если вы хотите заменить существующий файл на новый, просто замените старый файл на новый в репозитории и проверьте, совпадают ли имена в «htmltojson.js»

!Наконец, просто запустите «htmltojson.js», и все автоматически будет экспортировано в data.json!

— К каждой функции и важным местам кода я написал комментарии на английском языке. Пожалуйста, проверьте, прежде чем что-то менять в коде.

Вот и все! Надеюсь, что вы справились с этим простым алгоритмом :)

P.S Если после нажатия на ячейку появились все пути разветвления, нажмите кнопку «Reset» и подождите немного времени, значит программа работает медленно, и на анализ всей информации может уйти 5-6 секунд. Это также зависит от объема данных в data.json. Чем больше данных в data.json, тем больше процессов необходимо выполнить с этими данными.