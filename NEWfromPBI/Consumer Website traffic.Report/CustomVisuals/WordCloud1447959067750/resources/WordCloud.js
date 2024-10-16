/*
 *  Power BI Visualizations
 *
 *  Copyright (c) Microsoft Corporation
 *  All rights reserved. 
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *   
 *  The above copyright notice and this permission notice shall be included in 
 *  all copies or substantial portions of the Software.
 *   
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */

/*
 *  This file is based on or incorporates material from the projects listed below (Third Party IP). 
 *  The original copyright notice and the license under which Microsoft received such Third Party IP, 
 *  are set forth below. Such licenses and notices are provided for informational purposes only. 
 *  Microsoft licenses the Third Party IP to you under the licensing terms for the Microsoft product. 
 *  Microsoft reserves all other rights not expressly granted under this agreement, whether by 
 *  implication, estoppel or otherwise.
 *  
 *  d3-cloud
 *  Copyright (c) 2013, Jason Davies.
 *  All rights reserved.
 *  
 *  Redistribution and use in source and binary forms, with or without
 *  modification, are permitted provided that the following conditions are met:
 * 
 *    * Redistributions of source code must retain the above copyright notice, this
 *      list of conditions and the following disclaimer.
 * 
 *    * Redistributions in binary form must reproduce the above copyright notice,
 *      this list of conditions and the following disclaimer in the documentation
 *      and/or other materials provided with the distribution.
 * 
 *    * The name Jason Davies may not be used to endorse or promote products
 *     derived from this software without specific prior written permission.
 *   
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 *  ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 *  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 *  DISCLAIMED. IN NO EVENT SHALL JASON DAVIES BE LIABLE FOR ANY DIRECT, INDIRECT,
 *  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 *  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 *  PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 *  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE
 *  OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
 *  ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

var powerbi;
(function (powerbi) {
    var visuals;
    (function (visuals) {
        var WordCloud1447959067750;
        (function (WordCloud1447959067750) {
            var ValueFormatter = powerbi.visuals.valueFormatter;
            var getAnimationDuration = visuals.AnimatorCommon.GetAnimationDuration;
            (function (WordCloudScaleType) {
                WordCloudScaleType[WordCloudScaleType["logn"] = 0] = "logn";
                WordCloudScaleType[WordCloudScaleType["sqrt"] = 1] = "sqrt";
                WordCloudScaleType[WordCloudScaleType["value"] = 2] = "value";
            })(WordCloud1447959067750.WordCloudScaleType || (WordCloud1447959067750.WordCloudScaleType = {}));
            var WordCloudScaleType = WordCloud1447959067750.WordCloudScaleType;
            ;
            var WordCloud = (function () {
                function WordCloud(constructorOptions) {
                    this.durationAnimations = 500;
                    this.margin = {
                        top: 10,
                        right: 10,
                        bottom: 10,
                        left: 10
                    };
                    this.fakeViewport = {
                        width: 1500,
                        height: 1000
                    };
                    this.canvasViewport = {
                        width: 128,
                        height: 2048
                    };
                    if (constructorOptions) {
                        this.svg = constructorOptions.svg || this.svg;
                        this.margin = constructorOptions.margin || this.margin;
                        if (constructorOptions.animator) {
                            this.animator = constructorOptions.animator;
                        }
                    }
                }
                WordCloud.prototype.init = function (visualsInitOptions) {
                    if (this.svg) {
                        this.root = this.svg;
                    }
                    else {
                        this.root = d3.select(visualsInitOptions.element.get(0)).append("svg");
                    }
                    this.root.classed(WordCloud.ClassName, true);
                    this.fontFamily = this.root.style("font-family");
                    this.main = this.root.append("g");
                    this.words = this.main.append("g").classed(WordCloud.Words["class"], true);
                    this.canvas = document.createElement("canvas");
                };
                WordCloud.prototype.converter = function (dataView, callback) {
                    if (!dataView || !dataView.categorical || !dataView.categorical.categories || !dataView.categorical.categories[0] || !dataView.categorical.categories[0].values || !dataView.categorical.categories[0].values.length || !(dataView.categorical.categories[0].values.length > 0)) {
                        return null;
                    }
                    var text = dataView.categorical.categories[0].values, settings = this.parseSettings(dataView, text[0]), frequencies;
                    if (!_.isEmpty(dataView.categorical.values) && !_.isEmpty(dataView.categorical.values[0]) && !_.isEmpty(dataView.categorical.values[0].values)) {
                        frequencies = dataView.categorical.values[0].values;
                    }
                    if (settings) {
                        this.settings = settings;
                    }
                    else {
                        return null;
                    }
                    this.computePositions(this.getWords(this.getReducedText(text, frequencies)), callback);
                };
                WordCloud.prototype.parseSettings = function (dataView, value) {
                    if (!dataView || !dataView.metadata || !dataView.metadata.columns || !dataView.metadata.columns[0]) {
                        return null;
                    }
                    var objects = this.getObjectsFromDataView(dataView), valueFormatter, minFontSize, maxFontSize, minAngle, maxAngle, maxNumberOfOrientations, isRotateText = false, isBrokenText = true, isRemoveStopWords = true, stopWords, stopWordsArray, isDefaultStopWords = false, maxNumberOfWords;
                    maxNumberOfWords = this.getNumberFromObjects(objects, WordCloud.Properties.general.maxNumberOfWords, WordCloud.DefaultSettings.maxNumberOfWords);
                    minFontSize = this.getNumberFromObjects(objects, WordCloud.Properties.general.minFontSize, WordCloud.DefaultSettings.minFontSize);
                    maxFontSize = this.getNumberFromObjects(objects, WordCloud.Properties.general.maxFontSize, WordCloud.DefaultSettings.maxFontSize);
                    minAngle = this.getNumberFromObjects(objects, WordCloud.Properties.rotateText.minAngle, WordCloud.DefaultSettings.minAngle);
                    maxAngle = this.getNumberFromObjects(objects, WordCloud.Properties.rotateText.maxAngle, WordCloud.DefaultSettings.maxAngle);
                    isRotateText = powerbi.DataViewObjects.getValue(objects, WordCloud.Properties.rotateText.show, WordCloud.DefaultSettings.isRotateText);
                    maxNumberOfOrientations = this.getNumberFromObjects(objects, WordCloud.Properties.rotateText.maxNumberOfOrientations, WordCloud.DefaultSettings.maxNumberOfOrientations);
                    valueFormatter = ValueFormatter.create({
                        format: ValueFormatter.getFormatString(dataView.categorical.categories[0].source, WordCloud.Properties.general.formatString),
                        value: value
                    });
                    isBrokenText = powerbi.DataViewObjects.getValue(objects, WordCloud.Properties.general.isBrokenText, WordCloud.DefaultSettings.isBrokenText);
                    isRemoveStopWords = powerbi.DataViewObjects.getValue(objects, WordCloud.Properties.stopWords.show, WordCloud.DefaultSettings.isRemoveStopWords);
                    stopWords = powerbi.DataViewObjects.getValue(objects, WordCloud.Properties.stopWords.words, WordCloud.DefaultSettings.stopWords);
                    if (typeof stopWords === "string") {
                        stopWordsArray = stopWords.split(WordCloud.StopWordsDelemiter);
                    }
                    else {
                        stopWordsArray = WordCloud.DefaultSettings.stopWordsArray;
                    }
                    isDefaultStopWords = powerbi.DataViewObjects.getValue(objects, WordCloud.Properties.stopWords.isDefaultStopWords, WordCloud.DefaultSettings.isDefaultStopWords);
                    return {
                        minFontSize: minFontSize,
                        maxFontSize: maxFontSize,
                        minAngle: minAngle,
                        maxAngle: maxAngle,
                        maxNumberOfOrientations: maxNumberOfOrientations,
                        valueFormatter: valueFormatter,
                        isRotateText: isRotateText,
                        isBrokenText: isBrokenText,
                        isRemoveStopWords: isRemoveStopWords,
                        stopWords: stopWords,
                        stopWordsArray: stopWordsArray,
                        isDefaultStopWords: isDefaultStopWords,
                        maxNumberOfWords: maxNumberOfWords
                    };
                };
                WordCloud.prototype.getNumberFromObjects = function (objects, properties, defaultValue) {
                    if (!objects) {
                        return defaultValue;
                    }
                    return powerbi.DataViewObjects.getValue(objects, properties, defaultValue);
                };
                WordCloud.prototype.parseNumber = function (value, defaultValue, minValue, maxValue) {
                    if (defaultValue === void 0) { defaultValue = 0; }
                    if (minValue === void 0) { minValue = -Number.MAX_VALUE; }
                    if (maxValue === void 0) { maxValue = Number.MAX_VALUE; }
                    var parsedValue = Number(value);
                    if (isNaN(parsedValue) || (typeof value === "string" && value.length === 0)) {
                        return defaultValue;
                    }
                    if (parsedValue < minValue) {
                        return minValue;
                    }
                    if (parsedValue > maxValue) {
                        return maxValue;
                    }
                    return parsedValue;
                };
                WordCloud.prototype.getObjectsFromDataView = function (dataView) {
                    if (!dataView || !dataView.metadata || !dataView.metadata.columns || !dataView.metadata.objects) {
                        return null;
                    }
                    return dataView.metadata.objects;
                };
                WordCloud.prototype.computePositions = function (words, callback) {
                    var context = this.getCanvasContext(), wordsForDraw = [], surface = [], borders = null, index = 0, self = this, maxNumberOfWords;
                    if (!words || !(words.length > 0)) {
                        return null;
                    }
                    maxNumberOfWords = Math.abs(this.parseNumber(this.settings.maxNumberOfWords, WordCloud.DefaultSettings.maxNumberOfWords, words.length * -1, words.length));
                    if (words.length > maxNumberOfWords) {
                        words = words.slice(0, maxNumberOfWords);
                    }
                    for (var i; i < (this.viewport.width >> 5) * this.viewport.height; i++) {
                        surface[i] = 0;
                    }
                    function compute() {
                        var startDate = new Date();
                        while (true) {
                            var currentDate = new Date();
                            if (!(currentDate.getTime() - startDate.getTime() < WordCloud.UpdateInterval) || !self.updateTimer || !(index < words.length)) {
                                break;
                            }
                            var word = words[index], ratio = 1;
                            if (words.length <= 10) {
                                ratio = 5;
                            }
                            else if (words.length <= 25) {
                                ratio = 3;
                            }
                            else if (words.length <= 75) {
                                ratio = 1.5;
                            }
                            else if (words.length <= 100) {
                                ratio = 1.25;
                            }
                            word.x = (self.viewport.width / ratio * (Math.random() + 0.5)) >> 1;
                            word.y = (self.viewport.height / ratio * (Math.random() + 0.5)) >> 1;
                            self.generateSprites(context, word, words, index);
                            if (word.sprite && self.findPosition(surface, word, borders)) {
                                wordsForDraw.push(word);
                                borders = self.updateBorders(word, borders);
                                word.x -= self.viewport.width >> 1;
                                word.y -= self.viewport.height >> 1;
                            }
                            index++;
                        }
                        if (index >= words.length) {
                            borders = borders ? borders : [];
                            clearInterval(self.updateTimer);
                            callback({
                                data: wordsForDraw,
                                leftBorder: borders[0],
                                rightBorder: borders[1]
                            });
                        }
                    }
                    if (this.updateTimer) {
                        clearInterval(this.updateTimer);
                    }
                    this.updateTimer = setInterval(compute, WordCloud.UpdateInterval);
                };
                WordCloud.prototype.updateBorders = function (word, borders) {
                    if (borders && borders.length === 2) {
                        var leftBorder = borders[0], rightBorder = borders[1];
                        if (word.x + word.x0 < leftBorder.x) {
                            leftBorder.x = word.x + word.x0;
                        }
                        if (word.y + word.y0 < leftBorder.y) {
                            leftBorder.y = word.y + word.y0;
                        }
                        if (word.x + word.x1 > rightBorder.x) {
                            rightBorder.x = word.x + word.x1;
                        }
                        if (word.y + word.y1 > rightBorder.y) {
                            rightBorder.y = word.y + word.y1;
                        }
                    }
                    else {
                        borders = [
                            {
                                x: word.x + word.x0,
                                y: word.y + word.y0
                            },
                            {
                                x: word.x + word.x1,
                                y: word.y + word.y1
                            }
                        ];
                    }
                    return borders;
                };
                WordCloud.prototype.generateSprites = function (context, currentWord, words, index) {
                    if (currentWord.sprite) {
                        return;
                    }
                    context.clearRect(0, 0, this.canvasViewport.width << 5, this.canvasViewport.height);
                    var x = 0, y = 0, maxHeight = 0, quantityOfWords = words.length, pixels, sprite = [];
                    for (var i = index; i < quantityOfWords; i++) {
                        var currentWordData = words[i], widthOfWord = 0, heightOfWord = 0;
                        context.save();
                        context.font = "normal normal " + (currentWordData.size + 1) + WordCloud.Size + " " + this.fontFamily;
                        widthOfWord = context.measureText(currentWordData.text + "m").width;
                        heightOfWord = currentWordData.size << 1;
                        if (currentWordData.rotate) {
                            var sr = Math.sin(currentWordData.rotate * WordCloud.Radians), cr = Math.cos(currentWordData.rotate * WordCloud.Radians), widthCr = widthOfWord * cr, widthSr = widthOfWord * sr, heightCr = heightOfWord * cr, heightSr = heightOfWord * sr;
                            widthOfWord = (Math.max(Math.abs(widthCr + heightSr), Math.abs(widthCr - heightSr)) + 31) >> 5 << 5;
                            heightOfWord = Math.floor(Math.max(Math.abs(widthSr + heightCr), Math.abs(widthSr - heightCr)));
                        }
                        else {
                            widthOfWord = (widthOfWord + 31) >> 5 << 5;
                        }
                        if (heightOfWord > maxHeight) {
                            maxHeight = heightOfWord;
                        }
                        if (x + widthOfWord >= (this.canvasViewport.width << 5)) {
                            x = 0;
                            y += maxHeight;
                            maxHeight = 0;
                        }
                        context.translate((x + (widthOfWord >> 1)), (y + (heightOfWord >> 1)));
                        if (currentWordData.rotate) {
                            context.rotate(currentWordData.rotate * WordCloud.Radians);
                        }
                        context.fillText(currentWordData.text, 0, 0);
                        if (currentWordData.padding) {
                            context.lineWidth = 2 * currentWordData.padding;
                            context.strokeText(currentWordData.text, 0, 0);
                        }
                        context.restore();
                        currentWordData.width = widthOfWord;
                        currentWordData.height = heightOfWord;
                        currentWordData.xOff = x;
                        currentWordData.yOff = y;
                        currentWordData.x1 = widthOfWord >> 1;
                        currentWordData.y1 = heightOfWord >> 1;
                        currentWordData.x0 = -currentWordData.x1;
                        currentWordData.y0 = -currentWordData.y1;
                        x += widthOfWord;
                    }
                    pixels = context.getImageData(0, 0, this.canvasViewport.width << 5, this.canvasViewport.height).data;
                    sprite = [];
                    for (var i = quantityOfWords - 1; i >= 0; i--) {
                        var currentWordData = words[i], width = currentWordData.width, width32 = width >> 5, height = currentWordData.y1 - currentWordData.y0, x = 0, y = 0, seen = 0, seenRow = 0;
                        if (currentWordData.xOff + width >= (this.canvasViewport.width << 5) || currentWordData.yOff + height >= this.canvasViewport.height) {
                            currentWordData.sprite = null;
                            continue;
                        }
                        for (var j = 0; j < height * width32; j++) {
                            sprite[j] = 0;
                        }
                        if (currentWordData.xOff !== null) {
                            x = currentWordData.xOff;
                        }
                        else {
                            return;
                        }
                        y = currentWordData.yOff;
                        seen = 0;
                        seenRow = -1;
                        for (var j = 0; j < height; j++) {
                            for (var k = 0; k < width; k++) {
                                var l = width32 * j + (k >> 5), index = ((y + j) * (this.canvasViewport.width << 5) + (x + k)) << 2, m = pixels[index] ? 1 << (31 - (k % 32)) : 0;
                                sprite[l] |= m;
                                seen |= m;
                            }
                            if (seen) {
                                seenRow = j;
                            }
                            else {
                                currentWordData.y0++;
                                height--;
                                j--;
                                y++;
                            }
                        }
                        currentWordData.y1 = currentWordData.y0 + seenRow;
                        currentWordData.sprite = sprite.slice(0, (currentWordData.y1 - currentWordData.y0) * width32);
                    }
                };
                WordCloud.prototype.findPosition = function (surface, word, borders) {
                    var startPoint = { x: word.x, y: word.y }, delta = Math.sqrt(this.viewport.width * this.viewport.width + this.viewport.height * this.viewport.height), point, dt = Math.random() < 0.5 ? 1 : -1, shift = -dt, dx, dy;
                    while (true) {
                        shift += dt;
                        point = this.archimedeanSpiral(shift);
                        dx = Math.floor(point.x);
                        dy = Math.floor(point.y);
                        if (Math.min(Math.abs(dx), Math.abs(dy)) >= delta) {
                            break;
                        }
                        word.x = startPoint.x + dx;
                        word.y = startPoint.y + dy;
                        if (word.x + word.x0 < 0 || word.y + word.y0 < 0 || word.x + word.x1 > this.viewport.width || word.y + word.y1 > this.viewport.height) {
                            continue;
                        }
                        if (!borders || !this.checkIntersect(word, surface)) {
                            if (!borders || this.checkIntersectOfRectangles(word, borders[0], borders[1])) {
                                var sprite = word.sprite, width = word.width >> 5, shiftWidth = this.viewport.width >> 5, lx = word.x - (width << 4), sx = lx & 127, msx = 32 - sx, height = word.y1 - word.y0, x = (word.y + word.y0) * shiftWidth + (lx >> 5);
                                for (var i = 0; i < height; i++) {
                                    var lastSprite = 0;
                                    for (var j = 0; j <= width; j++) {
                                        var leftMask = lastSprite << msx, rightMask;
                                        if (j < width) {
                                            lastSprite = sprite[i * width + j];
                                        }
                                        rightMask = j < width ? lastSprite >>> sx : 0;
                                        surface[x + j] |= leftMask | rightMask;
                                    }
                                    x += shiftWidth;
                                }
                                word.sprite = null;
                                return true;
                            }
                        }
                    }
                    return false;
                };
                WordCloud.prototype.archimedeanSpiral = function (value) {
                    var ratio = this.viewport.width / this.viewport.height;
                    value = value * 0.1;
                    return {
                        x: ratio * value * Math.cos(value),
                        y: value * Math.sin(value)
                    };
                };
                WordCloud.prototype.checkIntersect = function (word, surface) {
                    var shiftWidth = this.viewport.width >> 5, sprite = word.sprite, widthOfWord = word.width >> 5, lx = word.x - (widthOfWord << 4), sx = lx & 127, msx = 32 - sx, heightOfWord = word.y1 - word.y0, x = (word.y + word.y0) * shiftWidth + (lx >> 5);
                    for (var i = 0; i < heightOfWord; i++) {
                        var lastSprite = 0;
                        for (var j = 0; j <= widthOfWord; j++) {
                            var mask = 0, leftMask, intersectMask = 0;
                            leftMask = lastSprite << msx;
                            if (j < widthOfWord) {
                                lastSprite = sprite[i * widthOfWord + j];
                            }
                            mask = j < widthOfWord ? lastSprite >>> sx : 0;
                            intersectMask = (leftMask | mask) & surface[x + j];
                            if (intersectMask) {
                                return true;
                            }
                        }
                        x += shiftWidth;
                    }
                    return false;
                };
                WordCloud.prototype.checkIntersectOfRectangles = function (word, leftBorder, rightBorder) {
                    return (word.x + word.x1) > leftBorder.x && (word.x + word.x0) < rightBorder.x && (word.y + word.y1) > leftBorder.y && (word.y + word.y0) < rightBorder.y;
                };
                WordCloud.prototype.getCanvasContext = function () {
                    if (!this.canvasViewport) {
                        return null;
                    }
                    this.canvas.width = 1;
                    this.canvas.height = 1;
                    var context = this.canvas.getContext("2d");
                    this.canvas.width = this.canvasViewport.width << 5;
                    this.canvas.height = this.canvasViewport.height;
                    context = this.canvas.getContext("2d");
                    context.fillStyle = context.strokeStyle = "red";
                    context.textAlign = "center";
                    return context;
                };
                WordCloud.prototype.getReducedText = function (text, frequencies) {
                    var convertedToWordCloudText, brokenStrings = [];
                    convertedToWordCloudText = this.convertValuesToWordCloudText(text, frequencies);
                    brokenStrings = this.getBrokenWords(convertedToWordCloudText);
                    return brokenStrings.reduce(function (previousValue, currentValue) {
                        if (!previousValue.some(function (value) {
                            if (value.index !== currentValue.index && value.text === currentValue.text) {
                                value.count++;
                                return true;
                            }
                            return false;
                        })) {
                            previousValue.push(currentValue);
                        }
                        return previousValue;
                    }, []);
                };
                WordCloud.prototype.convertValuesToWordCloudText = function (text, frequencies) {
                    return text.map(function (item, index) {
                        var frequency = 1;
                        if (frequencies && frequencies[index] && !isNaN(frequencies[index])) {
                            frequency = frequencies[index];
                        }
                        return {
                            text: item,
                            count: frequency,
                            index: index
                        };
                    });
                };
                WordCloud.prototype.getBrokenWords = function (words) {
                    var _this = this;
                    var brokenStrings = [], whiteSpaceRegExp = /\s/, punctuatuinRegExp;
                    if (!this.settings.isBrokenText) {
                        return words;
                    }
                    punctuatuinRegExp = new RegExp("[" + WordCloud.Punctuation.join("\\") + "]", "gim");
                    words.forEach(function (item) {
                        if (typeof item.text === "string") {
                            var words;
                            words = item.text.replace(punctuatuinRegExp, " ").split(whiteSpaceRegExp);
                            if (_this.settings.isRemoveStopWords) {
                                var stopWords = _this.settings.stopWordsArray;
                                if (_this.settings.isDefaultStopWords) {
                                    stopWords = stopWords.concat(WordCloud.StopWords);
                                }
                                words = words.filter(function (value) {
                                    return value.length > 0 && !stopWords.some(function (removeWord) {
                                        return value.toLocaleLowerCase() === removeWord.toLocaleLowerCase();
                                    });
                                });
                            }
                            words.forEach(function (element) {
                                if (element.length > 0 && !whiteSpaceRegExp.test(element)) {
                                    brokenStrings.push({
                                        text: element,
                                        count: item.count,
                                        index: item.index
                                    });
                                }
                            });
                        }
                        else {
                            brokenStrings.push(item);
                        }
                    });
                    return brokenStrings;
                };
                WordCloud.prototype.getWords = function (values) {
                    var _this = this;
                    var sortedValues, minValue = 0, maxValue = 0, valueFormatter = this.settings.valueFormatter;
                    if (!values || !(values.length >= 1)) {
                        return [];
                    }
                    sortedValues = values.sort(function (a, b) {
                        return b.count - a.count;
                    });
                    minValue = sortedValues[sortedValues.length - 1].count;
                    maxValue = sortedValues[0].count;
                    return values.map(function (value) {
                        return {
                            text: valueFormatter.format(value.text),
                            size: _this.getFontSize(value.count, minValue, maxValue),
                            x: 0,
                            y: 0,
                            rotate: _this.getAngle(),
                            padding: 1,
                            width: 0,
                            height: 0,
                            xOff: 0,
                            yOff: 0,
                            x0: 0,
                            y0: 0,
                            x1: 0,
                            y1: 0,
                            colour: _this.getRandomColor()
                        };
                    });
                };
                WordCloud.prototype.getRandomColor = function () {
                    var red = Math.floor(Math.random() * 255), green = Math.floor(Math.random() * 255), blue = Math.floor(Math.random() * 255);
                    return "rgb(" + red + "," + green + "," + blue + ")";
                };
                WordCloud.prototype.getFontSize = function (value, minValue, maxValue, scaleType) {
                    if (scaleType === void 0) { scaleType = 2 /* value */; }
                    var weight, fontSize, maxFontSize, minFontSize;
                    minFontSize = Math.abs(this.parseNumber(this.settings.minFontSize, WordCloud.DefaultSettings.minFontSize));
                    maxFontSize = Math.abs(this.parseNumber(this.settings.maxFontSize, WordCloud.DefaultSettings.maxFontSize));
                    if (minFontSize > maxFontSize) {
                        var buffer = minFontSize;
                        minFontSize = maxFontSize;
                        maxFontSize = buffer;
                    }
                    switch (scaleType) {
                        case 0 /* logn */: {
                            weight = Math.log(value);
                        }
                        case 1 /* sqrt */: {
                            weight = Math.sqrt(value);
                        }
                        case 2 /* value */: {
                            weight = value;
                        }
                    }
                    fontSize = weight > minValue ? (maxFontSize * (weight - minValue)) / (maxValue - minValue) : 0;
                    fontSize = (fontSize * 100) / maxFontSize;
                    fontSize = (fontSize * (maxFontSize - minFontSize)) / 100 + minFontSize;
                    return fontSize;
                };
                WordCloud.prototype.getAngle = function () {
                    if (!this.settings || !this.settings.isRotateText) {
                        return 0;
                    }
                    var minAngle, maxAngle, maxNumberOfOrientations, angle;
                    maxNumberOfOrientations = Math.abs(this.parseNumber(this.settings.maxNumberOfOrientations, 0));
                    minAngle = this.parseNumber(this.settings.minAngle, 0, WordCloud.MinAngle, WordCloud.MaxAngle);
                    maxAngle = this.parseNumber(this.settings.maxAngle, 0, WordCloud.MinAngle, WordCloud.MaxAngle);
                    if (minAngle > maxAngle) {
                        var buffer = minAngle;
                        minAngle = maxAngle;
                        maxAngle = buffer;
                    }
                    angle = Math.abs(((maxAngle - minAngle) / maxNumberOfOrientations) * Math.floor(Math.random() * maxNumberOfOrientations));
                    return maxNumberOfOrientations !== 0 ? minAngle + angle : 0;
                };
                WordCloud.prototype.update = function (visualUpdateOptions) {
                    var _this = this;
                    if (!visualUpdateOptions || !visualUpdateOptions.viewport || !visualUpdateOptions.dataViews || !visualUpdateOptions.dataViews[0] || !visualUpdateOptions.viewport || !(visualUpdateOptions.viewport.height >= 0) || !(visualUpdateOptions.viewport.width >= 0)) {
                        return;
                    }
                    var dataView = visualUpdateOptions.dataViews[0];
                    this.durationAnimations = getAnimationDuration(this.animator, visualUpdateOptions.suppressAnimations);
                    this.setSize(visualUpdateOptions.viewport);
                    this.converter(dataView, function (wordCloudDataView) {
                        _this.render(wordCloudDataView);
                    });
                };
                WordCloud.prototype.setSize = function (viewport) {
                    var height, width, fakeWidth, fakeHeight, ratio;
                    height = viewport.height - this.margin.top - this.margin.bottom;
                    width = viewport.width - this.margin.left - this.margin.right;
                    this.currentViewport = {
                        height: height,
                        width: width
                    };
                    ratio = Math.sqrt((this.fakeViewport.width * this.fakeViewport.height) / (width * height));
                    if (isNaN(ratio)) {
                        fakeHeight = fakeWidth = 1;
                    }
                    else {
                        fakeHeight = height * ratio;
                        fakeWidth = width * ratio;
                    }
                    this.viewport = {
                        height: fakeHeight,
                        width: fakeWidth
                    };
                    this.updateElements(viewport.height, viewport.width);
                };
                WordCloud.prototype.updateElements = function (height, width) {
                    this.root.attr({
                        "height": height,
                        "width": width
                    });
                };
                WordCloud.prototype.render = function (wordCloudDataView) {
                    if (!wordCloudDataView) {
                        return;
                    }
                    this.renderWords(wordCloudDataView);
                };
                WordCloud.prototype.renderWords = function (wordCloudDataView) {
                    var _this = this;
                    if (!wordCloudDataView || !wordCloudDataView.data) {
                        return;
                    }
                    var timeoutId, wordsSelection, animatedWordSelection, wordElements = this.main.select(WordCloud.Words.selector).selectAll(WordCloud.Word.selector), delayOfScaleView;
                    delayOfScaleView = wordElements[0].length === 0 ? 0 : this.durationAnimations;
                    wordsSelection = wordElements.data(wordCloudDataView.data);
                    this.animation(wordsSelection, this.durationAnimations).attr("transform", function (item) {
                        return "" + visuals.SVGUtil.translate(item.x, item.y) + "rotate(" + item.rotate + ")";
                    }).style("font-size", function (item) { return ("" + item.size + WordCloud.Size); });
                    animatedWordSelection = wordsSelection.enter().append("svg:text").attr("transform", function (item) {
                        return "" + visuals.SVGUtil.translate(item.x, item.y) + "rotate(" + item.rotate + ")";
                    }).style("font-size", "1px");
                    this.animation(animatedWordSelection, this.durationAnimations).style("font-size", function (item) { return ("" + item.size + WordCloud.Size); }).style("fill", function (item) { return item.colour; });
                    wordsSelection.text(function (item) { return item.text; }).classed(WordCloud.Word["class"], true);
                    wordsSelection.exit().remove();
                    timeoutId = setTimeout(function () {
                        _this.scaleMainView(wordCloudDataView, delayOfScaleView);
                        clearTimeout(timeoutId);
                    }, delayOfScaleView + WordCloud.RenderDelay);
                };
                WordCloud.prototype.scaleMainView = function (wordCloudDataView, durationAnimation) {
                    if (durationAnimation === void 0) { durationAnimation = 0; }
                    if (!wordCloudDataView || !wordCloudDataView.leftBorder || !wordCloudDataView.rightBorder) {
                        return;
                    }
                    var scale = 1, width = this.currentViewport.width, height = this.currentViewport.height, mainSVGRect = this.main.node()["getBBox"](), leftBorder = wordCloudDataView.leftBorder, rightBorder = wordCloudDataView.rightBorder, width2, height2, scaleByX, scaleByY;
                    scaleByX = width / Math.abs(leftBorder.x - rightBorder.x);
                    scaleByY = height / Math.abs(leftBorder.y - rightBorder.y);
                    scale = Math.min(scaleByX, scaleByY);
                    width2 = this.margin.left + (mainSVGRect.x * scale * -1) + (width - (mainSVGRect.width * scale)) / 2;
                    height2 = this.margin.top + (mainSVGRect.y * scale * -1) + (height - (mainSVGRect.height * scale)) / 2;
                    this.animation(this.main, durationAnimation).attr("transform", "" + visuals.SVGUtil.translate(width2, height2) + "scale(" + scale + ")");
                };
                WordCloud.prototype.enumerateObjectInstances = function (options) {
                    var instances = [];
                    if (!this.settings) {
                        return instances;
                    }
                    switch (options.objectName) {
                        case "general": {
                            var general = {
                                objectName: "general",
                                displayName: "general",
                                selector: null,
                                properties: {
                                    maxNumberOfWords: this.settings.maxNumberOfWords,
                                    minFontSize: this.settings.minFontSize,
                                    maxFontSize: this.settings.maxFontSize,
                                    isBrokenText: this.settings.isBrokenText
                                }
                            };
                            instances.push(general);
                            break;
                        }
                        case "rotateText": {
                            var rotateText = {
                                objectName: "rotateText",
                                displayName: "rotateText",
                                selector: null,
                                properties: {
                                    show: this.settings.isRotateText,
                                    minAngle: this.settings.minAngle,
                                    maxAngle: this.settings.maxAngle,
                                    maxNumberOfOrientations: this.settings.maxNumberOfOrientations
                                }
                            };
                            instances.push(rotateText);
                            break;
                        }
                        case "stopWords": {
                            var stopWords = {
                                objectName: "stopWords",
                                displayName: "stopWords",
                                selector: null,
                                properties: {
                                    show: this.settings.isRemoveStopWords,
                                    isDefaultStopWords: this.settings.isDefaultStopWords,
                                    words: this.settings.stopWords || this.settings.stopWordsArray.join(WordCloud.StopWordsDelemiter)
                                }
                            };
                            instances.push(stopWords);
                            break;
                        }
                    }
                    return instances;
                };
                WordCloud.prototype.animation = function (element, duration, callback) {
                    if (duration === void 0) { duration = 0; }
                    return element.transition().duration(duration).each("end", callback);
                };
                WordCloud.prototype.destroy = function () {
                    clearInterval(this.updateTimer);
                    this.root = null;
                    this.canvas = null;
                };
                WordCloud.ClassName = "wordCloud";
                WordCloud.Properties = {
                    general: {
                        formatString: {
                            objectName: "general",
                            propertyName: "formatString"
                        },
                        maxNumberOfWords: {
                            objectName: "general",
                            propertyName: "maxNumberOfWords"
                        },
                        minFontSize: {
                            objectName: "general",
                            propertyName: "minFontSize"
                        },
                        maxFontSize: {
                            objectName: "general",
                            propertyName: "maxFontSize"
                        },
                        isBrokenText: {
                            objectName: "general",
                            propertyName: "isBrokenText"
                        },
                    },
                    stopWords: {
                        show: {
                            objectName: "stopWords",
                            propertyName: "show"
                        },
                        isDefaultStopWords: {
                            objectName: "stopWords",
                            propertyName: "isDefaultStopWords"
                        },
                        words: {
                            objectName: "stopWords",
                            propertyName: "words"
                        },
                    },
                    rotateText: {
                        show: {
                            objectName: "rotateText",
                            propertyName: "show"
                        },
                        minAngle: {
                            objectName: "rotateText",
                            propertyName: "minAngle"
                        },
                        maxAngle: {
                            objectName: "rotateText",
                            propertyName: "maxAngle"
                        },
                        maxNumberOfOrientations: {
                            objectName: "rotateText",
                            propertyName: "maxNumberOfOrientations"
                        }
                    }
                };
                WordCloud.Words = {
                    "class": "words",
                    selector: ".words"
                };
                WordCloud.Word = {
                    "class": "word",
                    selector: ".word"
                };
                WordCloud.Size = "px";
                WordCloud.StopWordsDelemiter = " ";
                WordCloud.Radians = Math.PI / 180;
                WordCloud.UpdateInterval = 10;
                WordCloud.MinAngle = -180;
                WordCloud.MaxAngle = 180;
                WordCloud.MaxNumberOfWords = 2500;
                WordCloud.capabilities = {
                    dataRoles: [{
                        name: "Category",
                        kind: powerbi.VisualDataRoleKind.Grouping,
                        displayName: powerbi.data.createDisplayNameGetter("Role_DisplayName_Group")
                    }, {
                        name: "Values",
                        kind: powerbi.VisualDataRoleKind.Measure,
                        displayName: powerbi.data.createDisplayNameGetter("Role_DisplayName_Value")
                    }],
                    dataViewMappings: [{
                        conditions: [{
                            "Category": {
                                min: 1,
                                max: 1
                            },
                            "Values": {
                                min: 0,
                                max: 1
                            }
                        }],
                        categorical: {
                            categories: {
                                for: { in: "Category" },
                                dataReductionAlgorithm: { top: { count: WordCloud.MaxNumberOfWords } }
                            },
                            values: {
                                for: { in: "Values" }
                            }
                        }
                    }],
                    sorting: {
                        implicit: {
                            clauses: [{
                                role: "Values",
                                direction: 2
                            }]
                        }
                    },
                    objects: {
                        general: {
                            displayName: powerbi.data.createDisplayNameGetter("Visual_General"),
                            properties: {
                                formatString: {
                                    type: {
                                        formatting: {
                                            formatString: true
                                        }
                                    }
                                },
                                maxNumberOfWords: {
                                    displayName: "Max number of words",
                                    type: { numeric: true }
                                },
                                minFontSize: {
                                    displayName: "Min Font",
                                    type: { numeric: true }
                                },
                                maxFontSize: {
                                    displayName: "Max Font",
                                    type: { numeric: true }
                                },
                                isBrokenText: {
                                    displayName: "Word-breaking",
                                    type: { bool: true }
                                },
                                isRemoveStopWords: {
                                    displayName: "Stop Words",
                                    type: { bool: true }
                                }
                            }
                        },
                        stopWords: {
                            displayName: "Stop Words",
                            properties: {
                                show: {
                                    displayName: powerbi.data.createDisplayNameGetter("Visual_Show"),
                                    type: { bool: true }
                                },
                                isDefaultStopWords: {
                                    displayName: "Default Stop Words",
                                    type: { bool: true }
                                },
                                words: {
                                    displayName: "Words",
                                    type: { text: true }
                                }
                            }
                        },
                        rotateText: {
                            displayName: "Rotate Text",
                            properties: {
                                show: {
                                    displayName: powerbi.data.createDisplayNameGetter("Visual_Show"),
                                    type: { bool: true }
                                },
                                minAngle: {
                                    displayName: "Min Angle",
                                    type: { numeric: true }
                                },
                                maxAngle: {
                                    displayName: "Max Angle",
                                    type: { numeric: true }
                                },
                                maxNumberOfOrientations: {
                                    displayName: "Max number of orientations",
                                    type: { numeric: true }
                                }
                            }
                        }
                    }
                };
                WordCloud.Punctuation = [
                    "!",
                    ".",
                    ":",
                    "'",
                    ";",
                    ",",
                    "!",
                    "@",
                    "#",
                    "$",
                    "%",
                    "^",
                    "&",
                    "*",
                    "(",
                    ")",
                    "[",
                    "]",
                    "\"",
                    "\\",
                    "/",
                    "-",
                    "_",
                    "+",
                    "="
                ];
                WordCloud.StopWords = [
                    "a",
                    "able",
                    "about",
                    "across",
                    "after",
                    "all",
                    "almost",
                    "also",
                    "am",
                    "among",
                    "an",
                    "and",
                    "any",
                    "are",
                    "as",
                    "at",
                    "be",
                    "because",
                    "been",
                    "but",
                    "by",
                    "can",
                    "cannot",
                    "could",
                    "did",
                    "do",
                    "does",
                    "either",
                    "else",
                    "ever",
                    "every",
                    "for",
                    "from",
                    "get",
                    "got",
                    "had",
                    "has",
                    "have",
                    "he",
                    "her",
                    "hers",
                    "him",
                    "his",
                    "how",
                    "however",
                    "i",
                    "if",
                    "in",
                    "into",
                    "is",
                    "it",
                    "its",
                    "just",
                    "least",
                    "var",
                    "like",
                    "likely",
                    "may",
                    "me",
                    "might",
                    "most",
                    "must",
                    "my",
                    "neither",
                    "no",
                    "nor",
                    "not",
                    "of",
                    "off",
                    "often",
                    "on",
                    "only",
                    "or",
                    "other",
                    "our",
                    "own",
                    "rather",
                    "said",
                    "say",
                    "says",
                    "she",
                    "should",
                    "since",
                    "so",
                    "some",
                    "than",
                    "that",
                    "the",
                    "their",
                    "them",
                    "then",
                    "there",
                    "these",
                    "they",
                    "this",
                    "tis",
                    "to",
                    "too",
                    "twas",
                    "us",
                    "wants",
                    "was",
                    "we",
                    "were",
                    "what",
                    "when",
                    "where",
                    "which",
                    "while",
                    "who",
                    "whom",
                    "why",
                    "will",
                    "with",
                    "would",
                    "yet",
                    "you",
                    "your"
                ];
                WordCloud.DefaultSettings = {
                    minFontSize: 20,
                    maxFontSize: 100,
                    minAngle: -60,
                    maxAngle: 90,
                    maxNumberOfOrientations: 2,
                    isRotateText: false,
                    isBrokenText: true,
                    isRemoveStopWords: false,
                    stopWordsArray: [],
                    stopWords: undefined,
                    isDefaultStopWords: false,
                    maxNumberOfWords: 200
                };
                WordCloud.RenderDelay = 50;
                return WordCloud;
            })();
            WordCloud1447959067750.WordCloud = WordCloud;
        })(WordCloud1447959067750 = visuals.WordCloud1447959067750 || (visuals.WordCloud1447959067750 = {}));
    })(visuals = powerbi.visuals || (powerbi.visuals = {}));
})(powerbi || (powerbi = {}));
var powerbi;
(function (powerbi) {
    var visuals;
    (function (visuals) {
        var plugins;
        (function (plugins) {
            plugins.WordCloud1447959067750 = {
                name: 'WordCloud1447959067750',
                class: 'WordCloud1447959067750',
                capabilities: powerbi.visuals.WordCloud1447959067750.WordCloud.capabilities,
                custom: true,
                create: function () { return new powerbi.visuals.WordCloud1447959067750.WordCloud({
                    animator: new powerbi.visuals.BaseAnimator()
                }); }
            };
        })(plugins = visuals.plugins || (visuals.plugins = {}));
    })(visuals = powerbi.visuals || (powerbi.visuals = {}));
})(powerbi || (powerbi = {}));
