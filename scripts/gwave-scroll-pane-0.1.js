/**
 * jQuery Google Wave Scroll Pane
 * Version 0.1 2010-11-02
 * 
 * @requires jQuery v1.3+
 * @author Konr Ness http://konrness.com
 * 
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 */
(function($) {
$.fn.gWaveScrollPane = function(settings) {
    var config = {
        'foo': 'bar'
    };

    if (settings) $.extend(config, settings);

    return this.each(function() {
        
        var $this = $(this);
        var $scrollableWrapper, $scrollbarContainer, $scrollbarGrabber, $scrollbarIndicator;

        var waitToMoveGrabber = false;

        /**
         * Setup Scrollable Wrapper
         */
        // create gwave-scroll-wrapper
        $scrollableWrapper = $('<div class="gwave-scroll-wrapper"/>');

        // set width/height to be same as this
        $scrollableWrapper.height($this.height()).width($this.width());

        // add scrollable wrapper to DOM just before this
        $this.before($scrollableWrapper);

        // put this inside scrollable wrapper
        $this.appendTo($scrollableWrapper);

        /**
         * Create the scrollbar
         */
        $scrollbarContainer = $('<div class="scrollbar-container"><div class="scrollbar-bottom"/></div>');
        $scrollbarGrabber   = $('<div class="scrollbar-grabber"><div class="up"/><div class="down"/></div>');
        $scrollbarIndicator = $('<div class="scrollbar-indicator"/>');

        $scrollbarContainer.prepend($scrollbarIndicator);
        $scrollbarContainer.prepend($scrollbarGrabber);

        $scrollableWrapper.prepend($scrollbarContainer);

        /**
         * Setup initial layout
         */
        
        // hide indicator
        $scrollbarIndicator.hide();

        // grabber up/down button mouseovers
        $scrollbarGrabber.children().each(function(){
            $(this).mouseover(function(){
                $scrollbarGrabber.addClass(this.className + '-over');
            }).mouseleave(function(){
                $scrollbarGrabber.removeClass(this.className + '-over');
            });
        });

        // reset content's scroll top
        $this.scrollTop(0);
        $this.data('goal-scroll-top', $this.scrollTop());

        /**
         * Setup content scrolling events
         */
        
        // listen to scroll changes from box and update indicator position
        $this.bind('scroll', function(e){

            scrollPercentage = this.scrollTop / (this.scrollHeight - this.offsetHeight);

            newIndicatorTop = ($scrollbarContainer.height() - $scrollbarIndicator.height()) * scrollPercentage;
            newIndicatorTop = newIndicatorTop + 'px';

            $scrollbarIndicator.css('top', newIndicatorTop);

        });

        // setup mousewheel scrolling for content box
        $this.bind('mousewheel', function(event, delta) {
            $this.scrollTop($this.scrollTop() + (-delta*45));
            $this.data('goal-scroll-top', $this.scrollTop());
            updateGrabberPosition(true);
            return false;
        });

        /**
         * Setup grabber events
         */

        // grabber dragging
        $scrollbarGrabber.draggable({
            addClasses  : false,
            axis        : 'y',
            containment : 'parent',
            distance    : 2,
            cursor      : 'pointer',
            start       : function(){
                $scrollbarIndicator.show();
            },
            stop        : function(){
                $scrollbarIndicator.hide();
            },
            drag        : function(){
                scrollPercentage = $scrollbarGrabber.position().top / ($scrollbarContainer.height() - $scrollbarGrabber.height());
                scrollToPercentage(scrollPercentage);
            }
        }).mouseout(function(){
            waitToMoveGrabber = false;
            updateGrabberPosition(false);
        });

        // grabber arrow clicking
        $scrollbarGrabber.children('div').click(function(){
            direction = $(this).hasClass('up') ? -1 : 1;
            waitToMoveGrabber = true;
            $scrollbarIndicator.show();
            scrollByDelta(direction * 150);
        });

        /**
         * Functions
         */
        function updateGrabberPosition(immediate) {

            if(waitToMoveGrabber == true){
                return;
            }

            if($scrollbarGrabber.hasClass('ui-draggable-dragging')){
                return;
            }

            contentScrollPercentage = $this.get(0).scrollTop / ($this.get(0).scrollHeight - $this.get(0).offsetHeight);
            newGrabberTop = contentScrollPercentage * ($scrollbarContainer.height() - $scrollbarGrabber.height());

            if(immediate) {
                $scrollbarGrabber.css('top', newGrabberTop + 'px');
                $scrollbarIndicator.hide();
            } else {
                // animate
                $scrollbarGrabber.stop().animate(
                    { 
                        top : newGrabberTop + 'px'
                    },
                    250, 
                    'swing',
                    function(){
                        $scrollbarIndicator.hide();
                    }
                );
            }
        }

        function scrollToPercentage(percentage) {

            newContentTop = ($this.get(0).scrollHeight - $this.height()) * percentage;
            
            $this.data('goal-scroll-top', newContentTop);
            
            $this.stop().animate(
                { 
                    scrollTop: newContentTop + 'px'
                },
                500, 
                'swing'
            );
            
        }

        function scrollByDelta(delta) {

            newContentTop = $this.data('goal-scroll-top') + delta;
            
            $this.data('goal-scroll-top', newContentTop);
            
            $this.stop().animate(
                { 
                    scrollTop: newContentTop + 'px'
                },
                500, 
                'swing'
            );
            
        }

    });

};

})(jQuery);
