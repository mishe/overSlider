//水平滚动组件
$.extend($.fn, {
    overSlide: function (options, callback) {
        var $this = $(this),
            $parent = $this.parent(),
            $child = $this.children(),
            wrapWidth = $parent.outerWidth(true),
            wrapPadding = parseInt($this.css('padding-left')) + parseInt($this.css('padding-right')),
            childsWidth = 0,
            minMove = 1,
            defaultOptions = {
                move: true,
                padding: 20
            };

        if ($.type(options) == 'function') {
            callback = options;
            options = {};
        } else {
            options = $.extend(true, defaultOptions, options);
        }
        childsWidth += options.padding;
        $child.each(function () {
            childsWidth += $(this).outerWidth(true);
        });
        childsWidth += wrapPadding;

        var _bindEvent = function () {
            var starty = startX = dx = dy = endTy = endTx = 0,
                oldDate;
            $this.addClass('bindedEvent').css('width', childsWidth);
            $parent.on('touchstart', function (e) {
                oldDate = new Date();
                starty = e.originalEvent.touches[0].clientY;
                if (!options.move) {
                    startX = e.originalEvent.touches[0].clientX;
                } else {
                    startX = e.originalEvent.touches[0].clientX - $this.offset().left;
                }
            });
            $parent.on('touchmove', function (e) {
                endTy = e.originalEvent.touches[0].clientY || e.originalEvent.changedTouches[0].clientY;
                endX = e.originalEvent.touches[0].clientX || e.originalEvent.changedTouches[0].clientX;

                dx = Math.abs(endX - startX);
                dy = Math.abs(endTy - starty);
                //竖向拖动不阻止默认事件
                if ((dy > dx || dy > 10 ) || dx < minMove) {
                    return;
                }
                event.preventDefault();
                dx = endX - startX;
                dy = endTy - starty;
                if (options.move !== false) {
                    $this.setTransitionTime(0);
                    $this.translate3d(dx);
                }
            });

            $parent.on('touchend', function (e) {
                var newDate = new Date();
                if ((dx < 12 || dx > -12) && (dy > -12 || dy < 12) && newDate - oldDate < 200 && options.tap) {
                    oldDate = newDate;
                    $parent.trigger('tap');
                }
                var offleft = $this.offset().left;
                $this.setTransitionTime(0.3);
                if (offleft > 0) {
                    $this.translate3d(0);
                }
                if (offleft < -(childsWidth - wrapWidth)) {
                    $this.translate3d(-(childsWidth - wrapWidth));
                }
                callback && callback(dx, dy);
                dx = 0;
                dy = 0;
            });
        }
        if ($this.hasClass('bindedEvent')) {
            return;
        }

        if (childsWidth > wrapWidth) {
            _bindEvent();
        }
        return {
            destory: function () {
                $this.removeClass('bindedEvent');
                $parent.off();
            },
            reset: function () {
                childsWidth = 0;
                wrapWidth = $this.parent().outerWidth(true);
//                if(wrapWidth>screen.availWidth)
//                    wrapWidth=screen.availWidth;
                $this.children().each(function () {
                    childsWidth += $(this).outerWidth(true);
                });
                childsWidth += wrapPadding + options.padding;
                $this.css('width', childsWidth);
            },
            moveTo: function (num) {
                var moveX = 0;
                $this.children().each(function (i) {
                    if (num - i > 0) {
                        moveX += $(this).outerWidth(true);
                    }
                });
                if (-moveX < -(childsWidth - wrapWidth)) {
                    moveX = childsWidth - wrapWidth;
                }
                if (moveX < wrapWidth) {
                    moveX = 0;
                }
                $this.setTransitionTime(0);
                $this.translate3d(-moveX);
                oldX = -moveX;
            }
        }
    },
    overSlides: function (callback) {
        $(this).each(function () {
            $(this).overSlide(callback);
        })
    },
    bannerSlide: function (pageObj, autoscroll) {
        var slideObj = $(this),
            $child = $(this).children(),
            slideWidth = $child.outerWidth(true),
            countPage = $child.length,
            slideCurPage = 1,
            returnObj,
            timeout;
        $child.css('width', $child.outerWidth(true));
        pageObj.eq(0).addClass('active').siblings().removeClass('active');

        function autoScrollBanner() {
            if (autoscroll !== 0) {
                clearInterval(timeout);
                timeout = setInterval(function () {
                    turnPage(-21);
                }, autoscroll);
            }
        }

        var turnPage = function (dx) {

            if (dx > 20) {
                slideCurPage -= 1;
                slideCurPage = slideCurPage == 0 ? countPage : slideCurPage;
            } else if (dx < -20) {
                slideCurPage += 1;
                slideCurPage = slideCurPage > countPage ? 1 : slideCurPage;
            }

            slideObj.translate3d(-(slideCurPage - 1) * slideWidth);
            pageObj.eq(slideCurPage - 1).addClass('active').siblings().removeClass('active');
            //console.log(slideCurPage, countPage, dx);
            autoScrollBanner();
        };

        returnObj = slideObj.overSlide({move: false, tap: true}, function (dx) {
            turnPage(dx);
        });

        autoScrollBanner();


        return {
            next: function () {
                turnPage(-21);
            },
            prev: function () {
                turnPage(21);
            }
        };
    }
});
