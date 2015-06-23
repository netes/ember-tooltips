import Ember from 'ember';
import renderTooltip from 'ember-tooltips/utils/render-tooltip';

export function initialize(/* container, application */) {

  Ember.View.reopen({

    /* The tooltip object */

    tooltip: null,
    tooltipSupportedProperties: [
      'auto',
      'effectClass',
      'event',
      'place',
      'spacing',
      'typeClass'
    ],

    /* Tooltip options - see http://darsa.in/tooltip/ */

    tooltipAuto: true,
    tooltipContent: null,
    tooltipEffectClass: 'slide', // fade, grow, slide, null
    tooltipEvent: 'hover',
    tooltipPlace: 'top',
    tooltipSpacing: null,
    tooltipTypeClass: null,

    /**
    Adds a tooltip to the current view using the values of the tooltip
    properties on the view or, if a `{{tooltip-on-parent}}` component is
    passed, the values set on the component.

    In the latter case, the `{{tooltip-on-parent}}` block template will
    be used for the tooltip content.

    ## Example 1 - Setting values on a view or component

    ```hbs
    {{#some-component tooltipContent='This will show' tooltipPlace='right'}}
      Hover over me
    {{/some-component}}
    ```

    ## Example 2 - Using a child component

    ```hbs
    {{#some-component}}

      {{#tooltip-on-parent place='right'}}
        This will show
      {{/tooltip-on-parent}}

      Hover over me

    {{/some-component}}
    ```

    Usually you won't have to call the `renderTooltip` method directly but it's still
    made publically available. In the above examples, the components handle calling
    this `renderTooltip()` method at the correct time.

    Supported options are in the format tooltip{$capitalizedProperty} where
    capitalizedProperty is each property, capitalized, in tooltipSupportedProperties.

    @method renderTooltip
    @param [maybeTooltipComponent] An optionally-passed component for a `{{tooltip-on-parent}}` class
    */

    renderTooltip: Ember.on('didInsertElement', function(maybeTooltipComponent) {
      const componentWasPassed = Ember.typeOf(maybeTooltipComponent) === 'instance';
      const component = componentWasPassed ? maybeTooltipComponent : Ember.Object.create({});
      const content = component.get('content') || component.get('element') || this.get('tooltipContent');

      let tooltip, tooltipOptions;

      if (!content) {
        return;
      }

      tooltipOptions = {
        content
      };

      this.get('tooltipSupportedProperties').forEach(function(property) {
        const capitalizedProperty = Ember.String.capitalize(property);

        tooltipOptions[property] = component.get(property) || this.get(`tooltip${capitalizedProperty}`);
      }, this);

      tooltip = renderTooltip(this.get('element'), tooltipOptions);

      this.set('tooltip', tooltip);
    }),

    /**
    Call this method on any view to attach tooltips to all elements in its
    template that have a `.tooltip` class. Tooltip options are set using
    data attributes.

    ```hbs
    {{!--app/templates/components/some-widget.hbs--}}
    <div
      class="has-tooltip"
      data-tooltip-content="This will show"
      data-tooltip-position="right"
      data-tooltip-effect-class="grow"
    >
      Hover over me!
    </div>
    ```

    ```js
    // app/components/some-widget.js

    export default Ember.Component.extend({

      renderTooltipsInTemplate: function() {
        this.renderTooltip();
      }.on('didInsertElement'),

    });
    ```

    Supported options are in the format data-tooltip-{$dasherizedProperty} where
    dasherizedProperty is each property, dasherized, in tooltipSupportedProperties.


    @method renderChildTooltips
    */

    renderChildTooltips: function() {
      const tooltipSupportedProperties = this.get('tooltipSupportedProperties');

      Ember.run.scheduleOnce('render', this, function() {
        const tooltipOptions = {};

        this.$().find('.has-tooltip').each(function() {
          const $element = Ember.$(this);

          tooltipSupportedProperties.forEach(function(property) {
            const dasherizedProperty = Ember.String.dasherize(property);

            tooltipOptions[property] = $element.data(`tooltip-${dasherizedProperty}`);
          }, this);

          renderTooltip(this, tooltipOptions);
        });
      });
    },

  });

}

export default {
  name: 'add-tooltips-to-views',
  initialize: initialize
};
