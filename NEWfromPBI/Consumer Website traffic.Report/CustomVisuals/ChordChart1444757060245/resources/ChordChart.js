var powerbi;
(function (powerbi) {
    var visuals;
    (function (visuals) {
        var ChordChart1444757060245;
        (function (ChordChart1444757060245) {
            var ChordChart = (function () {
                function ChordChart() {
                }
                /* Convert a DataView into a view model */
                ChordChart.converter = function (dataView, colors, prevAxisVisible) {
                    var catDv = dataView.categorical;
                    if (catDv.categories && catDv.categories.length > 0 && catDv.values && catDv.categories[0].values) {
                        var cat = catDv.categories[0];
                        var catValues = cat.values;
                        var values = catDv.values;
                        var dataMatrix = [];
                        var legendData = {
                            dataPoints: [],
                            title: values[0].source.displayName
                        };
                        var toolTipData = [];
                        var sliceTooltipData = [];
                        var max = 1000;
                        var seriesName = []; /* series name array */
                        var seriesIndex = []; /* series index array */
                        var catIndex = []; /* index array for category names */
                        var isDiffFromTo = false; /* boolean variable indicates that From and To are different */
                        var labelData = []; /* label data: !important */
                        var defaultDataPointColor = ChordChart.getDefaultDataPointColor(dataView).solid.color;
                        var colorHelper = new visuals.ColorHelper(colors, ChordChart.chordChartProps.dataPoint.fill, defaultDataPointColor);
                        for (var i = 0, iLen = catValues.length; i < iLen; i++) {
                            catIndex[catValues[i]] = i;
                        }
                        for (var i = 0, iLen = values.length; i < iLen; i++) {
                            var seriesNameStr = visuals.converterHelper.getSeriesName(values[i].source);
                            seriesName.push(seriesNameStr);
                            seriesIndex[seriesNameStr] = i;
                        }
                        var totalFields = this.union_arrays(catValues, seriesName);
                        if (ChordChart.getValidArrayLength(totalFields) === ChordChart.getValidArrayLength(catValues) + ChordChart.getValidArrayLength(seriesName)) {
                            isDiffFromTo = true;
                        }
                        var formatStringProp = ChordChart.chordChartProps.general.formatString;
                        var categorySourceFormatString = visuals.valueFormatter.getFormatString(cat.source, formatStringProp);
                        for (var i = 0, iLen = totalFields.length; i < iLen; i++) {
                            var id = null;
                            var color = '';
                            var isCategory = false;
                            if (catIndex[totalFields[i]] !== undefined) {
                                var index = catIndex[totalFields[i]];
                                id = visuals.SelectionIdBuilder.builder().withCategory(cat, catIndex[totalFields[i]]).createSelectionId();
                                isCategory = true;
                                var thisCategoryObjects = cat.objects ? cat.objects[index] : undefined;
                                color = colorHelper.getColorForSeriesValue(thisCategoryObjects, undefined, catValues[index]);
                            }
                            else if (seriesIndex[totalFields[i]] !== undefined) {
                                var index = seriesIndex[totalFields[i]];
                                var seriesData = values[index];
                                var seriesObjects = seriesData.objects && seriesData.objects[0];
                                var seriesNameStr = visuals.converterHelper.getSeriesName(seriesData.source);
                                id = visuals.SelectionId.createWithId(seriesData.identity);
                                isCategory = false;
                                color = colorHelper.getColorForSeriesValue(seriesObjects, undefined, seriesNameStr);
                            }
                            labelData.push({
                                label: totalFields[i],
                                labelColor: ChordChart.defaultLabelColor,
                                barColor: color,
                                isCategory: isCategory,
                                identity: id,
                                selected: false
                            });
                            dataMatrix.push([]);
                            toolTipData.push([]);
                            var formattedCategoryValue = visuals.valueFormatter.format(catValues[i], categorySourceFormatString);
                            for (var j = 0, jLen = totalFields.length; j < jLen; j++) {
                                var elementValue = 0;
                                var tooltipInfo = [];
                                if (catIndex[totalFields[i]] !== undefined && seriesIndex[totalFields[j]] !== undefined) {
                                    var row = catIndex[totalFields[i]];
                                    var col = seriesIndex[totalFields[j]];
                                    if (values[col].values[row] !== null) {
                                        elementValue = values[col].values[row];
                                        if (elementValue > max)
                                            max = elementValue;
                                        tooltipInfo = visuals.TooltipBuilder.createTooltipInfo(formatStringProp, catDv, formattedCategoryValue, elementValue, null, null, col, row);
                                    }
                                }
                                else if (isDiffFromTo && catIndex[totalFields[j]] !== undefined && seriesIndex[totalFields[i]] !== undefined) {
                                    var row = catIndex[totalFields[j]];
                                    var col = seriesIndex[totalFields[i]];
                                    if (values[col].values[row] != null) {
                                        elementValue = values[col].values[row];
                                    }
                                }
                                dataMatrix[i].push(elementValue);
                                toolTipData[i].push({
                                    tooltipInfo: tooltipInfo
                                });
                            }
                            var totalSum = d3.sum(dataMatrix[i]);
                            sliceTooltipData.push({
                                tooltipInfo: [{
                                    displayName: totalFields[i],
                                    value: (ChordChart.isInt(totalSum)) ? totalSum.toFixed(0) : totalSum.toFixed(2)
                                }]
                            });
                        }
                        var chordLayout = d3.layout.chord().padding(0.1).matrix(dataMatrix);
                        var unitLength = Math.round(max / 5).toString().length - 1;
                        return {
                            dataMatrix: dataMatrix,
                            labelDataPoints: ChordChart.convertToChordArcDescriptor(chordLayout.groups(), labelData),
                            legendData: legendData,
                            tooltipData: toolTipData,
                            sliceTooltipData: sliceTooltipData,
                            tickUnit: Math.pow(10, unitLength),
                            differentFromTo: isDiffFromTo,
                            defaultDataPointColor: defaultDataPointColor,
                            prevAxisVisible: prevAxisVisible,
                            showAllDataPoints: ChordChart.getShowAllDataPoints(dataView),
                            showLabels: ChordChart.getLabelsShow(dataView),
                            showAxis: ChordChart.getAxisShow(dataView),
                        };
                    }
                    else {
                        return {
                            dataMatrix: [],
                            labelDataPoints: [],
                            legendData: null,
                            tooltipData: [],
                            sliceTooltipData: [],
                            tickUnit: 1000,
                            differentFromTo: false,
                            defaultDataPointColor: defaultDataPointColor,
                            prevAxisVisible: prevAxisVisible,
                            showAllDataPoints: ChordChart.getShowAllDataPoints(dataView),
                            showLabels: ChordChart.getLabelsShow(dataView),
                            showAxis: ChordChart.getAxisShow(dataView),
                        };
                    }
                };
                /* Check every element of the array and returns the count of elements which are valid(not undefined) */
                ChordChart.getValidArrayLength = function (array) {
                    var len = 0;
                    for (var i = 0, iLen = array.length; i < iLen; i++) {
                        if (array[i] !== undefined) {
                            len++;
                        }
                    }
                    return len;
                };
                /* Convert ChordLayout to ChordArcDescriptor */
                ChordChart.convertToChordArcDescriptor = function (groups, datum) {
                    var labelDataPoints = [];
                    for (var i = 0, iLen = groups.length; i < iLen; i++) {
                        var labelDataPoint = groups[i];
                        labelDataPoint.data = datum[i];
                        labelDataPoints.push(labelDataPoint);
                    }
                    return labelDataPoints;
                };
                /* Calculate radius */
                ChordChart.prototype.calculateRadius = function (viewport) {
                    if (this.data && this.data.showLabels) {
                        // if we have category or data labels, use a sigmoid to blend the desired denominator from 2 to 3.
                        // if we are taller than we are wide, we need to use a larger denominator to leave horizontal room for the labels.
                        var hw = viewport.height / viewport.width;
                        var denom = 2 + (1 / (1 + Math.exp(-5 * (hw - 1))));
                        return Math.min(viewport.height, viewport.width) / denom;
                    }
                    // no labels
                    return Math.min(viewport.height, viewport.width) / 2;
                };
                /* Draw category labels */
                ChordChart.drawDefaultCategoryLabels = function (graphicsContext, chordData, radius, viewport) {
                    /** Multiplier to place the end point of the reference line at 0.05 * radius away from the outer edge of the chord/pie. */
                    var arc = d3.svg.arc().innerRadius(0).outerRadius(radius * ChordChart.InnerArcRadiusRatio);
                    var outerArc = d3.svg.arc().innerRadius(radius * ChordChart.OuterArcRadiusRatio).outerRadius(radius * ChordChart.OuterArcRadiusRatio);
                    if (chordData.showLabels) {
                        var labelLayout = ChordChart.getChordChartLabelLayout(radius, outerArc, viewport);
                        ChordChart.drawDefaultLabelsForChordChart(chordData.labelDataPoints, graphicsContext, labelLayout, viewport, radius, arc, outerArc);
                    }
                    else
                        visuals.dataLabelUtils.cleanDataLabels(graphicsContext, true);
                };
                /* One time setup*/
                ChordChart.prototype.init = function (options) {
                    var element = this.element = options.element;
                    this.selectionManager = new visuals.utility.SelectionManager({ hostServices: options.host });
                    this.svg = d3.select(element.get(0)).append('svg').style('position', 'absolute').classed(ChordChart.VisualClassName, true);
                    this.mainGraphicsContext = this.svg.append('g');
                    this.mainGraphicsContext.append('g').classed('slices', true);
                    this.mainGraphicsContext.append('g').classed('ticks', true);
                    this.mainGraphicsContext.append('g').classed('chords', true);
                    this.colors = options.style.colorPalette.dataColors;
                };
                /* Called for data, size, formatting changes*/
                ChordChart.prototype.update = function (options) {
                    var _this = this;
                    // assert dataView           
                    if (!options.dataViews || !options.dataViews[0])
                        return;
                    // get animation duration
                    var duration = options.suppressAnimations ? 0 : visuals.AnimatorCommon.MinervaAnimationDuration;
                    var dataView = this.dataView = options.dataViews[0];
                    var prevAxisShow = (this.data) ? this.data.showAxis : !ChordChart.getAxisShow(dataView);
                    var data = this.data = ChordChart.converter(dataView, this.colors, prevAxisShow);
                    var viewport = options.viewport;
                    var chordLayout = this.chordLayout = d3.layout.chord().padding(0.1).matrix(data.dataMatrix);
                    var width = viewport.width;
                    var height = viewport.height;
                    var radius = this.calculateRadius(viewport);
                    var sm = this.selectionManager;
                    var innerRadius = radius * ChordChart.defaultSliceWidthRatio;
                    var outerRadius = radius * ChordChart.InnerArcRadiusRatio;
                    var arc = d3.svg.arc().innerRadius(innerRadius).outerRadius(outerRadius);
                    this.svg.attr({
                        'width': width,
                        'height': height
                    }).on('click', function () { return _this.selectionManager.clear().then(function () {
                        sliceShapes.style('opacity', 1);
                        chordShapes.style('opacity', 1);
                    }); });
                    var mainGraphicsContext = this.mainGraphicsContext.attr('transform', visuals.SVGUtil.translate(width / 2, height / 2));
                    var sliceShapes = this.svg.select('.slices').selectAll('path' + ChordChart.sliceClass.selector).data(chordLayout.groups);
                    sliceShapes.enter().insert("path").classed(ChordChart.sliceClass.class, true);
                    sliceShapes.style('fill', function (d, i) { return data.labelDataPoints[i].data.barColor; }).style("stroke", function (d, i) { return data.labelDataPoints[i].data.barColor; }).on('click', function (d, i) {
                        var _this = this;
                        sm.select(data.labelDataPoints[i].data.identity).then(function (ids) {
                            if (ids.length > 0) {
                                mainGraphicsContext.selectAll(".chords path.chord").style("opacity", 1);
                                mainGraphicsContext.selectAll(".slices path.slice").style('opacity', 0.3);
                                mainGraphicsContext.selectAll(".chords path.chord").filter(function (d) {
                                    return d.source.index !== i && d.target.index !== i;
                                }).style("opacity", 0.3);
                                d3.select(_this).style('opacity', 1);
                            }
                            else {
                                sliceShapes.style('opacity', 1);
                                mainGraphicsContext.selectAll(".chords path.chord").filter(function (d) {
                                    return d.source.index !== i && d.target.index !== i;
                                }).style("opacity", 1);
                            }
                        });
                        d3.event.stopPropagation();
                    }).transition().duration(duration).attr("d", arc);
                    sliceShapes.exit().remove();
                    visuals.TooltipManager.addTooltip(sliceShapes, function (tooltipEvent) {
                        var tooltipInfo = [];
                        return data.sliceTooltipData[tooltipEvent.data.index].tooltipInfo;
                    });
                    var chordShapes = this.svg.select('.chords').selectAll('path' + ChordChart.chordClass.selector).data(chordLayout.chords);
                    chordShapes.enter().insert("path").classed(ChordChart.chordClass.class, true);
                    chordShapes.style("fill", function (d, i) { return data.labelDataPoints[d.target.index].data.barColor; }).style("opacity", 1).transition().duration(duration).attr("d", d3.svg.chord().radius(innerRadius));
                    chordShapes.exit().remove();
                    ChordChart.drawTicks(this.mainGraphicsContext, data, chordLayout, outerRadius, duration, viewport);
                    ChordChart.drawDefaultCategoryLabels(this.mainGraphicsContext, data, radius, viewport);
                    visuals.TooltipManager.addTooltip(chordShapes, function (tooltipEvent) {
                        var tooltipInfo = [];
                        if (data.differentFromTo) {
                            tooltipInfo = data.tooltipData[tooltipEvent.data.source.index][tooltipEvent.data.source.subindex].tooltipInfo;
                        }
                        else {
                            tooltipInfo.push({
                                displayName: data.labelDataPoints[tooltipEvent.data.source.index].data.label + '->' + data.labelDataPoints[tooltipEvent.data.source.subindex].data.label,
                                value: data.dataMatrix[tooltipEvent.data.source.index][tooltipEvent.data.source.subindex].toString()
                            });
                            tooltipInfo.push({
                                displayName: data.labelDataPoints[tooltipEvent.data.target.index].data.label + '->' + data.labelDataPoints[tooltipEvent.data.target.subindex].data.label,
                                value: data.dataMatrix[tooltipEvent.data.target.index][tooltipEvent.data.target.subindex].toString()
                            });
                        }
                        return tooltipInfo;
                    });
                };
                /*About to remove your visual, do clean up here */
                ChordChart.prototype.destroy = function () {
                };
                /* Clean ticks */
                ChordChart.cleanTicks = function (context) {
                    var empty = [];
                    var tickLines = context.selectAll(ChordChart.tickLineClass.selector).data(empty);
                    tickLines.exit().remove();
                    var tickTexts = context.selectAll(ChordChart.tickTextClass.selector).data(empty);
                    tickTexts.exit().remove();
                    context.selectAll(ChordChart.tickPairClass.selector).remove();
                    context.selectAll(ChordChart.sliceTicksClass.selector).remove();
                };
                /* Draw axis(ticks) around the arc */
                ChordChart.drawTicks = function (graphicsContext, chordData, chordLayout, outerRadius, duration, viewport) {
                    if (chordData.showAxis) {
                        var tickShapes = graphicsContext.select('.ticks').selectAll('g' + ChordChart.sliceTicksClass.selector).data(chordLayout.groups);
                        var minSum = d3.min(chordLayout.groups(), function (d) { return d.value; });
                        var unit = Math.floor(minSum);
                        var animDuration = (chordData.prevAxisVisible == chordData.showAxis) ? duration : 0;
                        tickShapes.enter().insert('g').classed(ChordChart.sliceTicksClass.class, true);
                        var tickPairs = tickShapes.selectAll('g' + ChordChart.tickPairClass.selector).data(function (d) {
                            var k = (d.endAngle - d.startAngle) / d.value;
                            var lastIndex = Math.floor(d.value / chordData.tickUnit);
                            return d3.range(0, d.value, d.value - 1).map(function (v, i) {
                                var divider = 1000;
                                var unitStr = 'k';
                                if (chordData.tickUnit >= 1000 * 1000) {
                                    divider = 1000 * 1000;
                                    unitStr = 'm';
                                }
                                else if (chordData.tickUnit >= 1000) {
                                    divider = 1000;
                                    unitStr = 'k';
                                }
                                else {
                                    divider = 1;
                                    unitStr = '';
                                }
                                return {
                                    angle: v * k + d.startAngle,
                                    label: Math.floor(v / divider) + unitStr
                                };
                            });
                        });
                        tickPairs.enter().insert('g').classed(ChordChart.tickPairClass.class, true);
                        tickPairs.transition().duration(animDuration).attr('transform', function (d) {
                            return 'rotate(' + (d.angle * 180 / Math.PI - 90) + ')' + 'translate(' + outerRadius + ',0)';
                        });
                        tickPairs.selectAll('line' + ChordChart.tickLineClass.selector).data(function (d) { return [d]; }).enter().insert('line').classed(ChordChart.tickLineClass.class, true).style("stroke", "#000").attr("x1", 1).attr("y1", 0).attr("x2", 5).attr("y2", 0);
                        tickPairs.selectAll('text' + ChordChart.tickTextClass.selector).data(function (d) { return [d]; }).enter().insert('text').classed(ChordChart.tickTextClass.class, true).style("text-anchor", function (d) {
                            return d.angle > Math.PI ? "end" : null;
                        }).text(function (d) {
                            return d.label;
                        }).attr("transform", function (d) {
                            return d.angle > Math.PI ? "rotate(180)translate(-16)" : null;
                        }).attr("x", 8).attr("dy", ".35em");
                        tickPairs.exit().remove();
                        tickShapes.exit().remove();
                    }
                    else {
                        ChordChart.cleanTicks(graphicsContext);
                    }
                };
                /* Get format parameter axis whether it determines show ticks or not. Default value is true */
                ChordChart.getAxisShow = function (dataView) {
                    if (dataView) {
                        var objects = dataView.metadata.objects;
                        if (objects) {
                            var axis = objects['axis'];
                            if (axis && axis.hasOwnProperty('show')) {
                                return axis['show'];
                            }
                        }
                    }
                    return true;
                };
                /* Get format parameter labels whether it determines show labels or not. Default value is true */
                ChordChart.getLabelsShow = function (dataView) {
                    if (dataView) {
                        var objects = dataView.metadata.objects;
                        if (objects) {
                            var labels = objects['labels'];
                            if (labels && labels.hasOwnProperty('show')) {
                                return labels['show'];
                            }
                        }
                    }
                    return true;
                };
                /* Select labels */
                ChordChart.selectLabels = function (filteredData, context, isDonut, forAnimation) {
                    if (isDonut === void 0) { isDonut = false; }
                    if (forAnimation === void 0) { forAnimation = false; }
                    // Check for a case where resizing leaves no labels - then we need to remove the labels 'g'
                    if (filteredData.length === 0) {
                        visuals.dataLabelUtils.cleanDataLabels(context, true);
                        return null;
                    }
                    if (context.select(ChordChart.labelGraphicsContextClass.selector).empty())
                        context.append('g').classed(ChordChart.labelGraphicsContextClass.class, true);
                    // line chart ViewModel has a special 'key' property for point identification since the 'identity' field is set to the series identity
                    var hasKey = filteredData[0].key != null;
                    var hasDataPointIdentity = filteredData[0].identity != null;
                    var getIdentifier = hasKey ? function (d) { return d.key; } : hasDataPointIdentity ? function (d) { return d.identity.getKey(); } : undefined;
                    var labels = isDonut ? context.select(ChordChart.labelGraphicsContextClass.selector).selectAll(ChordChart.labelsClass.selector).data(filteredData, function (d) { return d.data.identity.getKey(); }) : getIdentifier != null ? context.select(ChordChart.labelGraphicsContextClass.selector).selectAll(ChordChart.labelsClass.selector).data(filteredData, getIdentifier) : context.select(ChordChart.labelGraphicsContextClass.selector).selectAll(ChordChart.labelsClass.selector).data(filteredData);
                    var newLabels = labels.enter().append('text').classed(ChordChart.labelsClass.class, true);
                    if (forAnimation)
                        newLabels.style('opacity', 0);
                    return labels;
                };
                /* Draw labels */
                ChordChart.drawDefaultLabelsForChordChart = function (data, context, layout, viewport, radius, arc, outerArc) {
                    // Hide and reposition labels that overlap
                    var dataLabelManager = new powerbi.DataLabelManager();
                    var filteredData = dataLabelManager.hideCollidedLabels(viewport, data, layout, true);
                    var labels = ChordChart.selectLabels(filteredData, context, true);
                    if (!labels)
                        return;
                    labels.attr({ x: function (d) { return d.labelX; }, y: function (d) { return d.labelY; }, dy: '.35em' }).text(function (d) { return d.labeltext; }).style(layout.style);
                    labels.exit().remove();
                    if (context.select(ChordChart.linesGraphicsContextClass.selector).empty())
                        context.append('g').classed(ChordChart.linesGraphicsContextClass.class, true);
                    var lines = context.select(ChordChart.linesGraphicsContextClass.selector).selectAll('polyline').data(filteredData, function (d) { return d.data.identity.getKey(); });
                    var innerLinePointMultiplier = 2.05;
                    var midAngle = function (d) {
                        return d.startAngle + (d.endAngle - d.startAngle) / 2;
                    };
                    lines.enter().append('polyline').classed(ChordChart.lineClass.class, true);
                    lines.attr('points', function (d) {
                        var textPoint = outerArc.centroid(d);
                        textPoint[0] = radius * 0.95 * (midAngle(d) < Math.PI ? 1 : -1);
                        var midPoint = outerArc.centroid(d);
                        var chartPoint = arc.centroid(d);
                        chartPoint[0] *= innerLinePointMultiplier;
                        chartPoint[1] *= innerLinePointMultiplier;
                        return [chartPoint, midPoint, textPoint];
                    }).style({
                        'opacity': function (d) { return ChordChart.PolylineOpacity; },
                        'stroke': function (d) { return d.data.labelColor; },
                    });
                    lines.exit().remove();
                };
                /* Get label layout */
                ChordChart.getChordChartLabelLayout = function (radius, outerArc, viewport) {
                    var midAngle = function (d) {
                        return d.startAngle + (d.endAngle - d.startAngle) / 2;
                    };
                    var spaceAvaliableForLabels = viewport.width / 2 - radius;
                    var minAvailableSpace = Math.min(spaceAvaliableForLabels, visuals.dataLabelUtils.maxLabelWidth);
                    return {
                        labelText: function (d) {
                            // show only category label
                            return visuals.dataLabelUtils.getLabelFormattedText(d.data.label, minAvailableSpace);
                        },
                        labelLayout: {
                            x: function (d) {
                                return radius * (midAngle(d) < Math.PI ? 1 : -1);
                            },
                            y: function (d) {
                                var pos = outerArc.centroid(d);
                                return pos[1];
                            },
                        },
                        filter: function (d) { return (d != null && d.data != null && d.data.label != null); },
                        style: {
                            'fill': function (d) { return d.data.labelColor; },
                            'text-anchor': function (d) { return midAngle(d) < Math.PI ? 'start' : 'end'; },
                        },
                    };
                };
                /* Get Default Datapoint color */
                ChordChart.getDefaultDataPointColor = function (dataView, defaultValue) {
                    if (dataView) {
                        var objects = dataView.metadata.objects;
                        if (objects) {
                            var dataPoint = objects['dataPoint'];
                            if (dataPoint && dataPoint.hasOwnProperty('defaultColor')) {
                                var defaultColor = dataPoint['defaultColor'];
                                if (defaultColor)
                                    return defaultColor;
                            }
                        }
                    }
                    return { solid: { color: defaultValue } };
                };
                /* Get format paramter value (showAllDataPoints)  */
                ChordChart.getShowAllDataPoints = function (dataView) {
                    if (dataView) {
                        var objects = dataView.metadata.objects;
                        if (objects) {
                            var dataPoint = objects['dataPoint'];
                            if (dataPoint && dataPoint.hasOwnProperty('showAllDataPoints')) {
                                return dataPoint['showAllDataPoints'];
                            }
                        }
                    }
                    return false;
                };
                /* Enumerate format values */
                ChordChart.prototype.enumerateObjectInstances = function (options) {
                    var instances = [];
                    switch (options.objectName) {
                        case 'axis':
                            var axis = {
                                objectName: 'axis',
                                displayName: 'Axis',
                                selector: null,
                                properties: {
                                    show: ChordChart.getAxisShow(this.dataView)
                                }
                            };
                            instances.push(axis);
                            break;
                        case 'labels':
                            var axis = {
                                objectName: 'labels',
                                displayName: 'Labels',
                                selector: null,
                                properties: {
                                    show: ChordChart.getLabelsShow(this.dataView)
                                }
                            };
                            instances.push(axis);
                            break;
                        case 'dataPoint':
                            var defaultColor = {
                                objectName: 'dataPoint',
                                selector: null,
                                properties: {
                                    defaultColor: { solid: { color: this.data.defaultDataPointColor || this.colors.getColorByIndex(0).value } }
                                }
                            };
                            instances.push(defaultColor);
                            var showAllDataPoints = {
                                objectName: 'dataPoint',
                                selector: null,
                                properties: {
                                    showAllDataPoints: !!this.data.showAllDataPoints
                                }
                            };
                            instances.push(showAllDataPoints);
                            for (var i = 0, iLen = this.data.labelDataPoints.length; i < iLen; i++) {
                                var labelDataPoint = this.data.labelDataPoints[i].data;
                                if (labelDataPoint.isCategory) {
                                    var colorInstance = {
                                        objectName: 'dataPoint',
                                        displayName: labelDataPoint.label,
                                        selector: visuals.ColorHelper.normalizeSelector(labelDataPoint.identity.getSelector()),
                                        properties: {
                                            fill: { solid: { color: labelDataPoint.barColor } }
                                        }
                                    };
                                    instances.push(colorInstance);
                                }
                            }
                            break;
                    }
                    return instances;
                };
                /* Utility function for checking if it is integer or float */
                ChordChart.isInt = function (n) {
                    return n % 1 === 0;
                };
                /* Utility function for union two arrays without duplicates */
                ChordChart.union_arrays = function (x, y) {
                    var obj = {};
                    for (var i = 0; i < x.length; i++) {
                        obj[x[i]] = x[i];
                    }
                    for (var i = 0; i < y.length; i++) {
                        obj[y[i]] = y[i];
                    }
                    var res = [];
                    for (var k in obj) {
                        if (obj.hasOwnProperty(k))
                            res.push(obj[k]);
                    }
                    return res;
                };
                ChordChart.capabilities = {
                    dataRoles: [
                        {
                            name: 'Category',
                            kind: powerbi.VisualDataRoleKind.Grouping,
                            displayName: 'From',
                        },
                        {
                            name: 'Series',
                            kind: powerbi.VisualDataRoleKind.Grouping,
                            displayName: 'To',
                        },
                        {
                            name: 'Y',
                            kind: powerbi.VisualDataRoleKind.Measure,
                            displayName: powerbi.data.createDisplayNameGetter('Role_DisplayName_Values'),
                        }
                    ],
                    dataViewMappings: [{
                        conditions: [
                            { 'Category': { max: 1 }, 'Series': { max: 0 } },
                            { 'Category': { max: 1 }, 'Series': { min: 1, max: 1 }, 'Y': { max: 1 } },
                            { 'Category': { max: 1 }, 'Series': { max: 0 }, 'Y': { min: 0, max: 1 } },
                        ],
                        categorical: {
                            categories: {
                                for: { in: 'Category' },
                                dataReductionAlgorithm: { top: {} }
                            },
                            values: {
                                group: {
                                    by: 'Series',
                                    select: [{ bind: { to: 'Y' } }],
                                    dataReductionAlgorithm: { top: {} }
                                },
                            },
                            rowCount: { preferred: { min: 2 }, supported: { min: 1 } }
                        },
                    }],
                    objects: {
                        dataPoint: {
                            displayName: powerbi.data.createDisplayNameGetter('Visual_DataPoint'),
                            properties: {
                                defaultColor: {
                                    displayName: powerbi.data.createDisplayNameGetter('Visual_DefaultColor'),
                                    type: { fill: { solid: { color: true } } }
                                },
                                showAllDataPoints: {
                                    displayName: powerbi.data.createDisplayNameGetter('Visual_DataPoint_Show_All'),
                                    type: { bool: true }
                                },
                                fill: {
                                    displayName: powerbi.data.createDisplayNameGetter('Visual_Fill'),
                                    type: { fill: { solid: { color: true } } }
                                },
                            },
                        },
                        axis: {
                            displayName: 'Axis',
                            properties: {
                                show: {
                                    type: { bool: true }
                                },
                            },
                        },
                        labels: {
                            displayName: 'Labels',
                            properties: {
                                show: {
                                    type: { bool: true }
                                },
                            },
                        }
                    }
                };
                ChordChart.chordChartProps = {
                    general: {
                        formatString: { objectName: 'general', propertyName: 'formatString' },
                    },
                    dataPoint: {
                        defaultColor: { objectName: 'dataPoint', propertyName: 'defaultColor' },
                        fill: { objectName: 'dataPoint', propertyName: 'fill' },
                        showAllDataPoints: { objectName: 'dataPoint', propertyName: 'showAllDataPoints' },
                    },
                    axis: {
                        show: { objectName: 'axis', propertyName: 'show' },
                    },
                    labels: {
                        show: { objectName: 'labels', propertyName: 'show' },
                    },
                };
                ChordChart.PolylineOpacity = 0.5;
                ChordChart.OuterArcRadiusRatio = 0.9;
                ChordChart.InnerArcRadiusRatio = 0.8;
                ChordChart.FontsizeThreshold = 150;
                ChordChart.SmallFontSize = '8px';
                ChordChart.NormalFontSize = '11px';
                ChordChart.OpaqueOpacity = 1.0;
                ChordChart.EffectiveZeroValue = 0.000000001; // Very small multiplier so that we have a properly shaped zero arc to animate to/from.
                ChordChart.SemiTransparentOpacity = 0.6;
                ChordChart.defaultSliceWidthRatio = 0.7;
                ChordChart.invisibleArcLengthInPixels = 3;
                ChordChart.defaultLabelColor = "#777777";
                ChordChart.VisualClassName = 'chordChart';
                ChordChart.layerClass = {
                    class: 'layer',
                    selector: '.layer',
                };
                ChordChart.sliceClass = {
                    class: 'slice',
                    selector: '.slice',
                };
                ChordChart.chordClass = {
                    class: 'chord',
                    selector: '.chord',
                };
                ChordChart.sliceTicksClass = {
                    class: 'slice-ticks',
                    selector: '.slice-ticks'
                };
                ChordChart.tickPairClass = {
                    class: 'tick-pair',
                    selector: '.tick-pair'
                };
                ChordChart.tickLineClass = {
                    class: 'tick-line',
                    selector: '.tick-line'
                };
                ChordChart.tickTextClass = {
                    class: 'tick-text',
                    selector: '.tick-text'
                };
                ChordChart.labelGraphicsContextClass = {
                    class: 'labels',
                    selector: '.labels',
                };
                ChordChart.labelsClass = {
                    class: 'data-labels',
                    selector: '.data-labels',
                };
                ChordChart.linesGraphicsContextClass = {
                    class: 'lines',
                    selector: '.lines',
                };
                ChordChart.lineClass = {
                    class: 'line-label',
                    selector: '.line-label',
                };
                return ChordChart;
            })();
            ChordChart1444757060245.ChordChart = ChordChart;
        })(ChordChart1444757060245 = visuals.ChordChart1444757060245 || (visuals.ChordChart1444757060245 = {}));
    })(visuals = powerbi.visuals || (powerbi.visuals = {}));
})(powerbi || (powerbi = {}));
var powerbi;
(function (powerbi) {
    var visuals;
    (function (visuals) {
        var plugins;
        (function (plugins) {
            plugins.ChordChart1444757060245 = {
                name: 'ChordChart1444757060245',
                class: 'ChordChart1444757060245',
                capabilities: powerbi.visuals.ChordChart1444757060245.ChordChart.capabilities,
                custom: true,
                create: function () { return new powerbi.visuals.ChordChart1444757060245.ChordChart(); }
            };
        })(plugins = visuals.plugins || (visuals.plugins = {}));
    })(visuals = powerbi.visuals || (powerbi.visuals = {}));
})(powerbi || (powerbi = {}));
