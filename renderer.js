/* compare-folders is an open source markdown reader packed by electron
Copyright (C) 2024-2025  Yu Hongbo, CNOCTAVE

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>. */

const { ipcRenderer } = require('electron');
const path = require('path');
const fs = require('fs');
const Diff = require("diff");

function sendActionToMain(action) {
    const id = Date.now()
    ipcRenderer.send('message-from-renderer', { action, id })

    ipcRenderer.on('message-from-main', (event, arg) => {
        event.sender.removeListener('message-from-main', arguments[1])
    })
}

function splitWithoutTrailingEmptyElement(str) {
    // 检查字符串是否以换行符结尾
    if (str.endsWith('\n')) {
        // 去除字符串末尾的换行符
        str = str.slice(0, -1);
    }
    // 分割字符串
    return str.split('\n');
}

function compareFolders(folder1, folder2) {
    var onlyInFolder1 = [];
    var onlyInFolder2 = [];
    var commonFiles = [];
    var files1 = [];
    var files2 = [];
    if (folder1 === '') {
        files2 = getFiles(folder2);
        onlyInFolder2 = files2;
    }
    else if (folder2 === '') {
        files1 = getFiles(folder1);
        onlyInFolder1 = files1;
    }
    else if ((folder1 !== '') && (folder2 !== '')) {
        files1 = getFiles(folder1);
        files2 = getFiles(folder2);
        onlyInFolder1 = files1.filter(file => !files2.includes(file));
        onlyInFolder2 = files2.filter(file => !files1.includes(file));
        commonFiles = files1.filter(file => files2.includes(file));
    }

    const differences = {
        onlyInFolder1,
        onlyInFolder2,
        commonFiles
    };

    return differences;
}

function getFiles(folder) {
    var entries = fs.readdirSync(folder);
    return entries;
}

ipcRenderer.on('selected-folder-1', (event, filePath) => {
    if (filePath) {
        // 记录路径
        document.getElementById('currentFolder1').innerHTML = filePath;
        // fileTitle1 文件夹1的显示标题DOM元素
        var fileTitle1 = document.getElementById('fileTitle1');
        fileTitle1.textContent = '';
        // fileTitle2 文件夹2的显示标题DOM元素
        var fileTitle2 = document.getElementById('fileTitle2');
        fileTitle2.textContent = '';
        // 请求主进程渲染文件列表
        ipcRenderer.send('render-folder-list', '');
    }
});

ipcRenderer.on('selected-folder-2', (event, filePath) => {
    if (filePath) {
        // 记录路径
        document.getElementById('currentFolder2').innerHTML = filePath;
        // fileTitle1 文件夹1的显示标题DOM元素
        var fileTitle1 = document.getElementById('fileTitle1');
        fileTitle1.textContent = '';
        // fileTitle2 文件夹2的显示标题DOM元素
        var fileTitle2 = document.getElementById('fileTitle2');
        fileTitle2.textContent = '';
        // 请求主进程渲染文件列表
        ipcRenderer.send('render-folder-list', '');
    }
});

ipcRenderer.on('clear-and-render-file-parts', (event, htmlContent) => {
    // currentFolder1 文件夹1的路径
    var currentFolder1 = document.getElementById('currentFolder1').innerHTML;
    // currentFolder2 文件夹2的路径
    var currentFolder2 = document.getElementById('currentFolder2').innerHTML;
    // filePart1 文件夹1的文件显示部分
    var filePart1 = document.getElementById('filePart1');
    filePart1.innerHTML = '';
    var emptyFolder = document.createElement('div');
    emptyFolder.setAttribute('class', 'empty-file');
    var newIcon = document.createElement('i');
    newIcon.setAttribute('class', 'q-icon notranslate material-icons');
    newIcon.setAttribute('aria-hidden', 'true');
    newIcon.setAttribute('role', 'presentation');
    newIcon.style.fontSize = '50px';
    newIcon.innerHTML = 'close';
    emptyFolder.appendChild(newIcon);
    var newDiv = document.createElement('div');
    newDiv.style.display = 'block';
    newDiv.style.width = '100%';
    newDiv.style.textAlign = 'center';
    newDiv.textContent = '无内容';
    emptyFolder.appendChild(newDiv);
    filePart1.appendChild(emptyFolder);
    // filePart2 文件夹2的文件显示部分
    var filePart2 = document.getElementById('filePart2');
    filePart2.innerHTML = '';
    var emptyFolder = document.createElement('div');
    emptyFolder.setAttribute('class', 'empty-file');
    var newIcon = document.createElement('i');
    newIcon.setAttribute('class', 'q-icon notranslate material-icons');
    newIcon.setAttribute('aria-hidden', 'true');
    newIcon.setAttribute('role', 'presentation');
    newIcon.style.fontSize = '50px';
    newIcon.innerHTML = 'close';
    emptyFolder.appendChild(newIcon);
    var newDiv = document.createElement('div');
    newDiv.style.display = 'block';
    newDiv.style.width = '100%';
    newDiv.style.textAlign = 'center';
    newDiv.textContent = '无内容';
    emptyFolder.appendChild(newDiv);
    filePart2.appendChild(emptyFolder);
    // fileFolderList1 文件夹1的文件列表显示部分
    var fileFolderList1 = document.getElementById('fileFolderList1');
    fileFolderList1.innerHTML = '';
    if (currentFolder1 === '') {
        var emptyFolder = document.createElement('div');
        emptyFolder.setAttribute('class', 'empty-folder');
        var newIcon = document.createElement('i');
        newIcon.setAttribute('class', 'q-icon notranslate material-icons');
        newIcon.setAttribute('aria-hidden', 'true');
        newIcon.setAttribute('role', 'presentation');
        newIcon.style.fontSize = '50px';
        newIcon.innerHTML = 'close';
        emptyFolder.appendChild(newIcon);
        var newDiv = document.createElement('div');
        newDiv.style.display = 'block';
        newDiv.style.width = '100%';
        newDiv.style.textAlign = 'center';
        newDiv.textContent = '无内容';
        emptyFolder.appendChild(newDiv);
        fileFolderList1.appendChild(emptyFolder);
    }

    // fileFolderList2 文件夹2的文件列表显示部分
    var fileFolderList2 = document.getElementById('fileFolderList2');
    fileFolderList2.innerHTML = '';
    if (currentFolder2 === '') {
        var emptyFolder = document.createElement('div');
        emptyFolder.setAttribute('class', 'empty-folder');
        var newIcon = document.createElement('i');
        newIcon.setAttribute('class', 'q-icon notranslate material-icons');
        newIcon.setAttribute('aria-hidden', 'true');
        newIcon.setAttribute('role', 'presentation');
        newIcon.style.fontSize = '50px';
        newIcon.innerHTML = 'close';
        emptyFolder.appendChild(newIcon);
        newDiv = document.createElement('div');
        newDiv.style.display = 'block';
        newDiv.style.width = '100%';
        newDiv.style.textAlign = 'center';
        newDiv.textContent = '无内容';
        emptyFolder.appendChild(newDiv);
        fileFolderList2.appendChild(emptyFolder);
    }
    // “打开文件夹1”按钮
    var openFolder12 = document.getElementById('openFolder12');
    // “打开文件夹2”按钮
    var openFolder22 = document.getElementById('openFolder22');
    var comparisonResult = {};
    var folderFiles1Content = [];
    var folderFiles2Content = [];
    if ((currentFolder1 !== '') || (currentFolder2 !== '')) {
        comparisonResult = compareFolders(currentFolder1, currentFolder2);
    }
    if (currentFolder1 !== '') {
        folderFiles1Content = getFiles(currentFolder1);
        openFolder12.innerHTML = currentFolder1;
    }
    else {
        openFolder12.innerHTML = '打开文件夹1';
    }
    if (currentFolder2 !== '') {
        folderFiles2Content = getFiles(currentFolder2);
        openFolder22.innerHTML = currentFolder2;
    }
    else {
        openFolder22.innerHTML = '打开文件夹2';
    }

    // folderFiles1 文件夹1中的文件列表
    var folderFiles1 = document.getElementById('folderFiles1');
    folderFiles1.innerHTML = JSON.stringify(folderFiles1Content);
    // folderFiles2 文件夹2中的文件列表
    var folderFiles2 = document.getElementById('folderFiles2');
    folderFiles2.innerHTML = JSON.stringify(folderFiles2Content);
    // onlyInFolder1 仅在文件夹1中的文件列表
    var onlyInFolder1 = document.getElementById('onlyInFolder1');
    onlyInFolder1.innerHTML = JSON.stringify(comparisonResult.onlyInFolder1);
    // onlyInFolder2 仅在文件夹2中的文件列表
    var onlyInFolder2 = document.getElementById('onlyInFolder2');
    onlyInFolder2.innerHTML = JSON.stringify(comparisonResult.onlyInFolder2);
    // commonFiles 同时在文件夹1和文件夹2中的文件列表
    var commonFiles = document.getElementById('commonFiles');
    commonFiles.innerHTML = JSON.stringify(comparisonResult.commonFiles);

    var notEmptyFolder1 = document.createElement('div');
    notEmptyFolder1.setAttribute('class', 'not-empty-folder');
    folderFiles1Content.forEach(function (item) {
        var div1 = document.createElement('div');
        if (comparisonResult.onlyInFolder1.includes(item)) {
            div1.className = 'green-bg';
        }
        else if ((currentFolder1 !== '') && (currentFolder2 !== '')) {
            const filePath1 = path.join(currentFolder1, item);
            const filePath2 = path.join(currentFolder2, item);
            fs.readFile(filePath1, 'utf8', (err, data1) => {
                if (err) {
                    return console.error('读取第一个文件时出错:', err);
                }

                fs.readFile(filePath2, 'utf8', (err, data2) => {
                    if (err) {
                        return console.error('读取第二个文件时出错:', err);
                    }

                    // 比较文件内容
                    if (data1 !== data2) {
                        div1.className = 'red-bg';
                    }
                });
            });
        }
        div1.style.cursor = 'pointer';
        div1.style.display = 'block';
        div1.style.borderTop = '1px solid grey';
        div1.style.borderBottom = '1px solid grey';
        div1.style.borderRight = '2px solid grey';
        div1.innerHTML = item;
        div1.addEventListener('click', function () {
            ipcRenderer.send('draw-file-part-prepare', item);
        });
        notEmptyFolder1.appendChild(div1);
    });
    fileFolderList1.appendChild(notEmptyFolder1);
    var notEmptyFolder2 = document.createElement('div');
    notEmptyFolder2.setAttribute('class', 'not-empty-folder');
    folderFiles2Content.forEach(function (item) {
        console.log("item: " + item);
        var div2 = document.createElement('div');
        if (comparisonResult.onlyInFolder2.includes(item)) {
            div2.className = 'green-bg';
        }
        else if ((currentFolder1 !== '') && (currentFolder2 !== '')) {
            const filePath1 = path.join(currentFolder1, item);
            const filePath2 = path.join(currentFolder2, item);
            fs.readFile(filePath1, 'utf8', (err, data1) => {
                if (err) {
                    return console.error('读取第一个文件时出错:', err);
                }

                fs.readFile(filePath2, 'utf8', (err, data2) => {
                    if (err) {
                        return console.error('读取第二个文件时出错:', err);
                    }

                    // 比较文件内容
                    if (data1 !== data2) {
                        div2.className = 'red-bg';
                    }
                });
            });
        }
        div2.style.cursor = 'pointer';
        div2.style.display = 'block';
        div2.style.borderTop = '1px solid grey';
        div2.style.borderBottom = '1px solid grey';
        div2.style.borderRight = '2px solid grey';
        div2.innerHTML = item;
        div2.addEventListener('click', function () {
            ipcRenderer.send('draw-file-part-prepare', item);
        });
        notEmptyFolder2.appendChild(div2);
    });
    fileFolderList2.appendChild(notEmptyFolder2);
});

ipcRenderer.on('draw-file-part', (event, fileName) => {
    // currentFolder1 文件夹1的路径
    var currentFolder1 = document.getElementById('currentFolder1').innerHTML;
    // currentFolder2 文件夹2的路径
    var currentFolder2 = document.getElementById('currentFolder2').innerHTML;
    // fileTitle1 文件夹1的显示标题DOM元素
    var fileTitle1 = document.getElementById('fileTitle1');
    // fileTitle2 文件夹2的显示标题DOM元素
    var fileTitle2 = document.getElementById('fileTitle2');
    // filePart1 文件夹1的文件显示部分
    var filePart1 = document.getElementById('filePart1');
    // filePart2 文件夹2的文件显示部分
    var filePart2 = document.getElementById('filePart2');
    const filePath1 = path.join(currentFolder1, fileName);
    const filePath2 = path.join(currentFolder2, fileName);
    fs.readFile(filePath1, 'utf8', (err1, data1) => {
        if (err1) {
            console.error('读取第一个文件时出错:', err1);
            fileTitle1.textContent = '（文件错误）文件夹1: ' + fileName;
            data1 = "";
            filePart1.innerHTML = '';
            var emptyFolder = document.createElement('div');
            emptyFolder.setAttribute('class', 'empty-file');
            var newIcon = document.createElement('i');
            newIcon.setAttribute('class', 'q-icon notranslate material-icons');
            newIcon.setAttribute('aria-hidden', 'true');
            newIcon.setAttribute('role', 'presentation');
            newIcon.style.fontSize = '50px';
            newIcon.innerHTML = 'close';
            emptyFolder.appendChild(newIcon);
            var newDiv = document.createElement('div');
            newDiv.style.display = 'block';
            newDiv.style.width = '100%';
            newDiv.style.textAlign = 'center';
            newDiv.textContent = '无内容';
            emptyFolder.appendChild(newDiv);
            filePart1.appendChild(emptyFolder);
        }
        else{
            fileTitle1.textContent = '文件夹1: ' + fileName;
        }

        fs.readFile(filePath2, 'utf8', (err2, data2) => {
            if (err2) {
                console.error('读取第二个文件时出错:', err2);
                fileTitle2.textContent = '（文件错误）文件夹2: ' + fileName;
                data2 = "";
                filePart2.innerHTML = '';
                var emptyFolder = document.createElement('div');
                emptyFolder.setAttribute('class', 'empty-file');
                var newIcon = document.createElement('i');
                newIcon.setAttribute('class', 'q-icon notranslate material-icons');
                newIcon.setAttribute('aria-hidden', 'true');
                newIcon.setAttribute('role', 'presentation');
                newIcon.style.fontSize = '50px';
                newIcon.innerHTML = 'close';
                emptyFolder.appendChild(newIcon);
                var newDiv = document.createElement('div');
                newDiv.style.display = 'block';
                newDiv.style.width = '100%';
                newDiv.style.textAlign = 'center';
                newDiv.textContent = '无内容';
                emptyFolder.appendChild(newDiv);
                filePart2.appendChild(emptyFolder);
            }
            else{
                fileTitle2.textContent = '文件夹2: ' + fileName;
            }
            // 比较文件内容
            let changes1 = Diff.diffLines(data1, data2);
            let changes2 = Diff.diffLines(data2, data1);
            let totalIndex = 0;
            if ((err1 == null) && (data1 !== '')) {
                filePart1.innerHTML = '';
                var notEmptyFile1 = document.createElement('div');
                notEmptyFile1.id = 'notEmptyFile1';
                notEmptyFile1.setAttribute('class', 'not-empty-file');
                filePart1.appendChild(notEmptyFile1);
                changes1.forEach(change => {
                    if (change.added) {
                        splitWithoutTrailingEmptyElement(change.value).forEach((line, index) => {
                            totalIndex = totalIndex + 1;
                            var indexTextLine = document.createElement('div');
                            indexTextLine.setAttribute('class', 'index-text-line');
                            indexTextLine.style.display = 'flex';
                            indexTextLine.style.width = '100%';
                            indexTextLine.style.flexWrap = 'wrap';
                            indexTextLine.style.justifyContent = 'flex-start';
                            indexTextLine.style.alignItems = 'stretch';
                            indexTextLine.style.borderTop = '1px solid grey';
                            indexTextLine.style.borderBottom = '1px solid grey';
                            indexTextLine.style.borderRight = '2px solid grey';
                            indexTextLine.style.alignContent = 'stretch';
                            var indexBlock = document.createElement('div');
                            indexBlock.style.display = 'block';
                            indexBlock.style.width = '5vw';
                            indexBlock.style.borderRight = '2px solid grey';
                            indexBlock.style.userSelect = 'none';
                            indexBlock.setAttribute('class', 'indigo-bg');
                            indexBlock.style.textAlign = 'center';
                            indexBlock.innerHTML = "+ " + totalIndex.toString();
                            indexTextLine.appendChild(indexBlock);
                            var textLine = document.createElement('div');
                            textLine.setAttribute('class', 'green-bg');
                            textLine.style.display = 'block';
                            textLine.style.width = 'calc(100% - 5vw)';
                            // textLine.style.borderRight = '2px solid grey';
                            textLine.style.whiteSpace = 'pre-wrap';
                            textLine.textContent = line;
                            indexTextLine.appendChild(textLine);
                            notEmptyFile1.appendChild(indexTextLine);
                        });
                    }
                    else if (change.removed) {
                        splitWithoutTrailingEmptyElement(change.value).forEach((line, index) => {
                            totalIndex = totalIndex + 1;
                            var indexTextLine = document.createElement('div');
                            indexTextLine.setAttribute('class', 'index-text-line');
                            indexTextLine.style.display = 'flex';
                            indexTextLine.style.width = '100%';
                            indexTextLine.style.flexWrap = 'wrap';
                            indexTextLine.style.justifyContent = 'flex-start';
                            indexTextLine.style.alignItems = 'stretch';
                            indexTextLine.style.borderTop = '1px solid grey';
                            indexTextLine.style.borderBottom = '1px solid grey';
                            indexTextLine.style.borderRight = '2px solid grey';
                            indexTextLine.style.alignContent = 'stretch';
                            var indexBlock = document.createElement('div');
                            indexBlock.style.display = 'block';
                            indexBlock.style.width = '5vw';
                            indexBlock.style.borderRight = '2px solid grey';
                            indexBlock.style.userSelect = 'none';
                            indexBlock.setAttribute('class', 'indigo-bg');
                            indexBlock.style.textAlign = 'center';
                            indexBlock.innerHTML = "- " + totalIndex.toString();
                            indexTextLine.appendChild(indexBlock);
                            var textLine = document.createElement('div');
                            textLine.setAttribute('class', 'red-bg');
                            textLine.style.display = 'block';
                            textLine.style.width = 'calc(100% - 5vw)';
                            // textLine.style.borderRight = '2px solid grey';
                            textLine.style.whiteSpace = 'pre-wrap';
                            textLine.textContent = line;
                            indexTextLine.appendChild(textLine);
                            notEmptyFile1.appendChild(indexTextLine);
                        });
                        totalIndex = totalIndex - splitWithoutTrailingEmptyElement(change.value).length;
                    }
                    else{
                        splitWithoutTrailingEmptyElement(change.value).forEach((line, index) => {
                            totalIndex = totalIndex + 1;
                            var indexTextLine = document.createElement('div');
                            indexTextLine.setAttribute('class', 'index-text-line');
                            indexTextLine.style.display = 'flex';
                            indexTextLine.style.width = '100%';
                            indexTextLine.style.flexWrap = 'wrap';
                            indexTextLine.style.justifyContent = 'flex-start';
                            indexTextLine.style.alignItems = 'stretch';
                            indexTextLine.style.borderTop = '1px solid grey';
                            indexTextLine.style.borderBottom = '1px solid grey';
                            indexTextLine.style.borderRight = '2px solid grey';
                            indexTextLine.style.alignContent = 'stretch';
                            var indexBlock = document.createElement('div');
                            indexBlock.style.display = 'block';
                            indexBlock.style.width = '5vw';
                            indexBlock.style.borderRight = '2px solid grey';
                            indexBlock.style.userSelect = 'none';
                            indexBlock.setAttribute('class', 'indigo-bg');
                            indexBlock.style.textAlign = 'center';
                            indexBlock.innerHTML = totalIndex.toString();
                            indexTextLine.appendChild(indexBlock);
                            var textLine = document.createElement('div');
                            textLine.style.display = 'block';
                            textLine.style.width = 'calc(100% - 5vw)';
                            // textLine.style.borderRight = '2px solid grey';
                            textLine.style.whiteSpace = 'pre-wrap';
                            textLine.textContent = line;
                            indexTextLine.appendChild(textLine);
                            notEmptyFile1.appendChild(indexTextLine);
                        });
                    }
                });
            }
            if ((err1 == null) && (data1 === '')){
                fileTitle1.textContent = '（空文件）文件夹1: ' + fileName;
                filePart1.innerHTML = '';
                var emptyFolder = document.createElement('div');
                emptyFolder.setAttribute('class', 'empty-file');
                var newIcon = document.createElement('i');
                newIcon.setAttribute('class', 'q-icon notranslate material-icons');
                newIcon.setAttribute('aria-hidden', 'true');
                newIcon.setAttribute('role', 'presentation');
                newIcon.style.fontSize = '50px';
                newIcon.innerHTML = 'close';
                emptyFolder.appendChild(newIcon);
                var newDiv = document.createElement('div');
                newDiv.style.display = 'block';
                newDiv.style.width = '100%';
                newDiv.style.textAlign = 'center';
                newDiv.textContent = '无内容';
                emptyFolder.appendChild(newDiv);
                filePart1.appendChild(emptyFolder);
            }


            if (err2 == null) {
                filePart2.innerHTML = '';
                var notEmptyFile2 = document.createElement('div');
                notEmptyFile2.id = 'notEmptyFile2';
                notEmptyFile2.setAttribute('class', 'not-empty-file');
                filePart2.appendChild(notEmptyFile2);
    
                totalIndex = 0;
    
                changes2.forEach(change => {
                    if (change.added) {
                        splitWithoutTrailingEmptyElement(change.value).forEach((line, index) => {
                            totalIndex = totalIndex + 1;
                            var indexTextLine = document.createElement('div');
                            indexTextLine.setAttribute('class', 'index-text-line');
                            indexTextLine.style.display = 'flex';
                            indexTextLine.style.width = '100%';
                            indexTextLine.style.flexWrap = 'wrap';
                            indexTextLine.style.justifyContent = 'flex-start';
                            indexTextLine.style.alignItems = 'stretch';
                            indexTextLine.style.borderTop = '1px solid grey';
                            indexTextLine.style.borderBottom = '1px solid grey';
                            indexTextLine.style.borderRight = '2px solid grey';
                            indexTextLine.style.alignContent = 'stretch';
                            var indexBlock = document.createElement('div');
                            indexBlock.style.display = 'block';
                            indexBlock.style.width = '5vw';
                            indexBlock.style.borderRight = '2px solid grey';
                            indexBlock.style.userSelect = 'none';
                            indexBlock.setAttribute('class', 'indigo-bg');
                            indexBlock.style.textAlign = 'center';
                            indexBlock.innerHTML = "+ " + totalIndex.toString();
                            indexTextLine.appendChild(indexBlock);
                            var textLine = document.createElement('div');
                            textLine.setAttribute('class', 'green-bg');
                            textLine.style.display = 'block';
                            textLine.style.width = 'calc(100% - 5vw)';
                            // textLine.style.borderRight = '2px solid grey';
                            textLine.style.whiteSpace = 'pre-wrap';
                            textLine.textContent = line;
                            indexTextLine.appendChild(textLine);
                            notEmptyFile2.appendChild(indexTextLine);
                        });
                    }
                    else if (change.removed) {
                        splitWithoutTrailingEmptyElement(change.value).forEach((line, index) => {
                            totalIndex = totalIndex + 1;
                            var indexTextLine = document.createElement('div');
                            indexTextLine.setAttribute('class', 'index-text-line');
                            indexTextLine.style.display = 'flex';
                            indexTextLine.style.width = '100%';
                            indexTextLine.style.flexWrap = 'wrap';
                            indexTextLine.style.justifyContent = 'flex-start';
                            indexTextLine.style.alignItems = 'stretch';
                            indexTextLine.style.borderTop = '1px solid grey';
                            indexTextLine.style.borderBottom = '1px solid grey';
                            indexTextLine.style.borderRight = '2px solid grey';
                            indexTextLine.style.alignContent = 'stretch';
                            var indexBlock = document.createElement('div');
                            indexBlock.style.display = 'block';
                            indexBlock.style.width = '5vw';
                            indexBlock.style.borderRight = '2px solid grey';
                            indexBlock.style.userSelect = 'none';
                            indexBlock.setAttribute('class', 'indigo-bg');
                            indexBlock.style.textAlign = 'center';
                            indexBlock.innerHTML = "- " + totalIndex.toString();
                            indexTextLine.appendChild(indexBlock);
                            var textLine = document.createElement('div');
                            textLine.setAttribute('class', 'red-bg');
                            textLine.style.display = 'block';
                            textLine.style.width = 'calc(100% - 5vw)';
                            // textLine.style.borderRight = '2px solid grey';
                            textLine.style.whiteSpace = 'pre-wrap';
                            textLine.textContent = line;
                            indexTextLine.appendChild(textLine);
                            notEmptyFile2.appendChild(indexTextLine);
                        });
                        totalIndex = totalIndex - splitWithoutTrailingEmptyElement(change.value).length;
                    }
                    else{
                        splitWithoutTrailingEmptyElement(change.value).forEach((line, index) => {
                            totalIndex = totalIndex + 1;
                            var indexTextLine = document.createElement('div');
                            indexTextLine.setAttribute('class', 'index-text-line');
                            indexTextLine.style.display = 'flex';
                            indexTextLine.style.width = '100%';
                            indexTextLine.style.flexWrap = 'wrap';
                            indexTextLine.style.justifyContent = 'flex-start';
                            indexTextLine.style.alignItems = 'stretch';
                            indexTextLine.style.borderTop = '1px solid grey';
                            indexTextLine.style.borderBottom = '1px solid grey';
                            indexTextLine.style.borderRight = '2px solid grey';
                            indexTextLine.style.alignContent = 'stretch';
                            var indexBlock = document.createElement('div');
                            indexBlock.style.display = 'block';
                            indexBlock.style.width = '5vw';
                            indexBlock.style.borderRight = '2px solid grey';
                            indexBlock.style.userSelect = 'none';
                            indexBlock.setAttribute('class', 'indigo-bg');
                            indexBlock.style.textAlign = 'center';
                            indexBlock.innerHTML = totalIndex.toString();
                            indexTextLine.appendChild(indexBlock);
                            var textLine = document.createElement('div');
                            textLine.style.display = 'block';
                            textLine.style.width = 'calc(100% - 5vw)';
                            // textLine.style.borderRight = '2px solid grey';
                            textLine.style.whiteSpace = 'pre-wrap';
                            textLine.textContent = line;
                            indexTextLine.appendChild(textLine);
                            notEmptyFile2.appendChild(indexTextLine);
                        });
                    }
                });
            }
            if ((err2 == null) && (data2 === '')){
                fileTitle2.textContent = '（空文件）文件夹2: ' + fileName;
                filePart2.innerHTML = '';
                var emptyFolder = document.createElement('div');
                emptyFolder.setAttribute('class', 'empty-file');
                var newIcon = document.createElement('i');
                newIcon.setAttribute('class', 'q-icon notranslate material-icons');
                newIcon.setAttribute('aria-hidden', 'true');
                newIcon.setAttribute('role', 'presentation');
                newIcon.style.fontSize = '50px';
                newIcon.innerHTML = 'close';
                emptyFolder.appendChild(newIcon);
                var newDiv = document.createElement('div');
                newDiv.style.display = 'block';
                newDiv.style.width = '100%';
                newDiv.style.textAlign = 'center';
                newDiv.textContent = '无内容';
                emptyFolder.appendChild(newDiv);
                filePart2.appendChild(emptyFolder);
            }

            // const linesArray2 = data1.split('\n');
            // let lineIndex2 = 0;
            // linesArray2.forEach(part => {
            //     lineIndex2 = lineIndex2 + 1;
            //     var indexTextLine = document.createElement('div');
            //     indexTextLine.style.display = 'flex';
            //     indexTextLine.style.flexWrap = 'wrap';
            //     indexTextLine.style.justifyContent = 'flex-start';
            //     indexTextLine.style.alignItems = 'stretch';
            //     indexTextLine.style.borderTop = '1px solid grey';
            //     indexTextLine.style.borderBottom = '1px solid grey';
            //     indexTextLine.style.borderRight = '2px solid grey';
            //     indexTextLine.style.alignContent = 'stretch';
            //     var indexBlock = document.createElement('div');
            //     indexBlock.style.display = 'block';
            //     indexBlock.style.width = '5vw';
            //     indexBlock.style.borderRight = '2px solid grey';
            //     indexBlock.style.userSelect = 'none';
            //     indexBlock.style.background = 'indigo';
            //     indexBlock.style.textAlign = 'center';
            //     indexBlock.innerHTML = lineIndex2.toString();
            //     indexTextLine.appendChild(indexBlock);
            //     var textLine = document.createElement('div');
            //     if (lineIndex2 % 2 == 1) {
            //         textLine.setAttribute('class', 'green-bg');
            //     }
            //     else {
            //         textLine.setAttribute('class', 'red-bg');
            //     }
            //     textLine.style.display = 'block';
            //     textLine.style.width = '35vw';
            //     textLine.style.borderRight = '2px solid grey';
            //     textLine.style.whiteSpace = 'pre-wrap';
            //     textLine.textContent = part;
            //     indexTextLine.appendChild(textLine);
            //     notEmptyFile2.appendChild(indexTextLine);
            // });



            // var editor = CodeMirror(document.getElementById('notEmptyFolder1'), {
            //     value: data1,
            //     lineNumbers: true,
            //     mode: 'javascript'
            // });
            // changes.forEach(part => {
            //     if (part.added && !part.removed) {
            //         part.value.split('\n').forEach((line, index) => {
            //             const lineNumber = part.value.split('\n').length - 1 - index;
            //             editor.addLineClass(lineNumber - 1, 'background', 'green-bg');
            //         });
            //     }
            //     else if (part.removed && !part.added) {
            //         part.value.split('\n').forEach((line, index) => {
            //             const lineNumber = part.value.split('\n').length - 1 - index;
            //             editor.addLineClass(lineNumber - 1, 'background', 'red-bg');
            //         });
            //     }
            // });

            // let language = new Compartment, tabSize = new Compartment;

            // // filePart1 文件夹1的文件显示部分
            // var filePart1 = document.getElementById('filePart1');
            // filePart1.innerHTML = '';
            // var notEmptyFolder1 = document.createElement('div');
            // notEmptyFolder1.id = 'notEmptyFolder1';
            // notEmptyFolder1.setAttribute('class', 'not-empty-file');
            // filePart1.appendChild(notEmptyFolder1);

            // let state1 = EditorState.create({
            //     doc: data1,
            //     extensions: [
            //         basicSetup,
            //         language.of(python()),
            //         tabSize.of(EditorState.tabSize.of(8))
            //     ]
            // });

            // let view1 = new EditorView({
            //     state1,
            //     parent: document.getElementById('notEmptyFolder1')
            // });

            // // filePart2 文件夹2的文件显示部分
            // var filePart2 = document.getElementById('filePart2');
            // filePart2.innerHTML = '';
            // var notEmptyFolder2 = document.createElement('div');
            // notEmptyFolder2.id = 'notEmptyFolder2';
            // notEmptyFolder2.setAttribute('class', 'not-empty-file');
            // filePart2.appendChild(notEmptyFolder2);

            // let state2 = EditorState.create({
            //     doc: data2,
            //     extensions: [
            //         basicSetup,
            //         language.of(python()),
            //         tabSize.of(EditorState.tabSize.of(8))
            //     ]
            // });

            // let view2 = new EditorView({
            //     state2,
            //     parent: document.getElementById('notEmptyFolder2')
            // });
        });
    });
});
