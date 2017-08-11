/*!
 * addel v1.3.2
 * https://github.com/legshooter/addel
 * Copyright 2017 legshooter
 * Released under the MIT license
 */
'use strict';

var pluginName = 'addel';

if (typeof jQuery === 'undefined') {
    throw new Error(pluginName + ' requires jQuery');
}

(function ($) {

    // sort of a constructor - sets up all vars
    var Plugin = function Plugin(container, options) {

        // saves a reference because 'this' is a reserved keyword that changes context inside the different scopes
        var plugin = this;

        this.$container = $(container);

        // merges the defaults with the user declared options
        this.settings = $.extend(true, {}, $.fn[pluginName].defaults, options);

        // hardcodes types of HTML form input elements
        this.settings.formElements = 'input, select, textarea';

        // gives data-attributes precedence over user declared options and defaults
        ['hide', 'add'].forEach(function (option) {
            plugin.settings[option] = plugin.$container.data(pluginName + '-' + option) || plugin.settings[option];
        });

        ['duration', 'easing'].forEach(function (option) {
            plugin.settings.animation[option] = plugin.$container.data(pluginName + '-animation-' + option) || plugin.settings.animation[option];
        });

        // sets classes and data-attributes as the selectors
        this.selectors = {};
        $.each(this.settings.classes, function (element, value) {
            plugin.selectors[element] = '.' + value + ', [data-' + pluginName + '-' + element + ']';
        });

    };

    Plugin.prototype = {

        // the core
        init: function init() {

            if (this.settings.hide) {
                this
                    .toggleTargetInputState(this.getLastTarget())
                    .hide();
            }

            this.$container
            // 'this' is being passed since we need a reference to the plugin's instance
            // and it's a reserved keyword that changes context inside the handlers
                .on('click', this.selectors.add, {plugin: this}, this.add)
                .on('click', this.selectors.delete, {plugin: this}, this.delete)
                // register events option callbacks
                .on(pluginName + ':add', this.settings.events.add)
                .on(pluginName + ':added', this.settings.events.added)
                .on(pluginName + ':delete', this.settings.events.delete)
                .on(pluginName + ':deleted', this.settings.events.deleted);

        },

        add: function add(event) {

            var plugin = event.data.plugin;
            var $target = plugin.getLastTarget();
            // gives the button's data-attribute precedence over the setting
            var amount = $(this).data(pluginName + '-add') || plugin.settings.add;

            // gives the user the possibility to opt out
            if (plugin.triggerAddEvent($target).isDefaultPrevented()) {
                return false;
            }

            var $added = $();

            if (plugin.getVisibleTargetsCount() === 0) {

                amount--;

                plugin.toggleTargetVisibility($target);

                $added = $added.add($target);

            }

            $added = $added.add(plugin.addTarget($target, amount));

            plugin.focusOnTargetInput($added);

        },

        addTarget: function addTarget($target, amount) {

            var plugin = this;

            // this will hold all added elements so we could eventually expose them to the user
            var $added = $();

            // makes sure target is fully drawn before cloning
            $target.finish();

            for (var i = 0; i < amount; i++) {

                var $clonedTarget = $target.clone();

                // this incurs the heaviest performance hit
                $added = $added.add($clonedTarget);

            }

            $added
                .insertAfter($target)
                .find(this.settings.formElements)
                // since even "clone(true)" won't keep "select"/"textarea" values, we'll just "null" for consistency
                // @see https://api.jquery.com/clone/
                .val(null)
                // enables the subsequent animation to display
                .hide()
                .fadeIn(this.settings.animation)
                // wait for animation/s to complete before firing event
                // this only works with a promise, instead of a fadeIn() complete callback
                // maybe because this is a collection of elements, @see http://api.jquery.com/fadein/
                .promise().done(function () {
                    plugin.triggerAddedEvent($target, $added);
                 });

            return $added;

        },

        delete: function del(event) {

            var plugin = event.data.plugin;
            var $target = $(this).closest(plugin.selectors.target);

            // gives the user the possibility to opt out
            if (plugin.triggerDeleteEvent($target).isDefaultPrevented()) {
                return false;
            }

            if (plugin.getVisibleTargetsCount() === 1) {

                plugin.toggleTargetVisibility($target);

                plugin.focusOnAdd();

            } else {

                // since the current target is a dependency, focus has to be called before delete
                plugin.focusOnDelete($target);

                plugin.deleteTarget($target);

            }

        },

        deleteTarget: function deleteTarget($target) {

            var plugin = this;

            $target
                // this lets other pieces of the puzzle know that this element will soon be removed from the DOM
                .addClass(this.settings.classes.deleting)
                .fadeOut(this.settings.animation.duration, this.settings.animation.easing, function () {
                    $(this).remove();
                    plugin.triggerDeletedEvent($target);
                });

        },

        toggleTargetVisibility: function toggleTargetVisibility($target) {

            this
                .toggleTargetInputState($target)
                .fadeToggle(this.settings.animation);

        },

        toggleTargetInputState: function toggleTargetInputState($target) {

            $target
                .find(this.settings.formElements)
                .prop('disabled', function ($name, $value) {
                    return !$value;
                });

            return $target;

        },

        focusOnTargetInput: function focusOnTargetInput($targets) {

            $targets
                .last()
                .find(':input:enabled:visible:first')
                .focus();

        },

        focusOnAdd: function focusOnAdd() {

            this.$container
                .find(this.selectors.add)
                .first()
                .focus();

        },

        focusOnDelete: function focusOnDelete($target) {

            var $prevTarget = $target.prev(this.selectors.target).not('.' + this.settings.classes.deleting);
            var $nextTarget = $target.next(this.selectors.target).not('.' + this.settings.classes.deleting);

            var $targetForFocus = $prevTarget.length ? $prevTarget : $nextTarget;

            $targetForFocus.find(this.selectors.delete).focus();

        },

        getLastTarget: function getLastTarget(amount) {

            return this.$container
                .find(this.selectors.target)
                // gets n last targets
                .slice(-amount || -1);
        },

        getVisibleTargetsCount: function getVisibleTargetsCount() {

            return this.$container
                .find(this.selectors.target)
                .filter(':visible')
                .not('.' + this.settings.classes.deleting)
                .length

        },

        triggerAddEvent: function triggerAddEvent($target) {

            var addEvent = $.Event(pluginName + ':add', {target: $target});

            this.$container.trigger(addEvent);

            // returns the event so event.isDefaultPrevented() could be checked
            return addEvent;

        },

        triggerAddedEvent: function triggerAddedEvent($target, $added) {

            this.$container.trigger(
                $.Event(pluginName + ':added', {target: $target, added: $added})
            );

        },

        triggerDeleteEvent: function triggerDeleteEvent($target) {

            var deleteEvent = $.Event(pluginName + ':delete', {target: $target});

            this.$container.trigger(deleteEvent);

            // returns the event so event.isDefaultPrevented() could be checked
            return deleteEvent;

        },

        triggerDeletedEvent: function triggerDeletedEvent($target) {

            this.$container.trigger(
                $.Event(pluginName + ':deleted', {target: $target})
            );

        }

    };

    // plugin wrapper
    // instantiates the plugin as many times as needed
    // and makes sure no duplication occurs
    $.fn[pluginName] = function (options) {
        return this.each(function () {
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName,
                    new Plugin(this, options)).init();
            }
        });
    };

    // sets overridable plugin defaults
    $.fn[pluginName].defaults = {
        hide: false,
        add: 1,
        classes: {
            target: pluginName + '-target',
            add: pluginName + '-add',
            delete: pluginName + '-delete',
            deleting: pluginName + '-deleting'
        },
        animation: {
            duration: 0,
            easing: 'swing'
        },
        events: {
            add: function () {
            },
            added: function () {
            },
            delete: function () {
            },
            deleted: function () {
            }
        }
    };

})(jQuery);