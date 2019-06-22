/**
@license
Copyright (c) 2019 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at
http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
part of the polymer project is also subject to an additional IP rights grant
found at http://polymer.github.io/PATENTS.txt
*/const supportsAdoptingStyleSheets="adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,constructionToken=Symbol();class CSSResult{constructor(cssText,safeToken){if(safeToken!==constructionToken){throw new Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.")}this.cssText=cssText}// Note, this is a getter so that it's lazy. In practice, this means
// stylesheets are not created until the first element instance is made.
get styleSheet(){if(this._styleSheet===void 0){// Note, if `adoptedStyleSheets` is supported then we assume CSSStyleSheet
// is constructable.
if(supportsAdoptingStyleSheets){this._styleSheet=new CSSStyleSheet;this._styleSheet.replaceSync(this.cssText)}else{this._styleSheet=null}}return this._styleSheet}toString(){return this.cssText}}/**
   * Wrap a value for interpolation in a css tagged template literal.
   *
   * This is unsafe because untrusted CSS text can be used to phone home
   * or exfiltrate data to an attacker controlled site. Take care to only use
   * this with trusted input.
   */const unsafeCSS=value=>{return new CSSResult(value+"",constructionToken)},textFromCSSResult=value=>{if(value instanceof CSSResult){return value.cssText}else if("number"===typeof value){return value}else{throw new Error(`Value passed to 'css' function must be a 'css' function result: ${value}. Use 'unsafeCSS' to pass non-literal values, but
            take care to ensure page security.`)}},css=(strings,...values)=>{const cssText=values.reduce((acc,v,idx)=>acc+textFromCSSResult(v)+strings[idx+1],strings[0]);return new CSSResult(cssText,constructionToken)};var cssTag={supportsAdoptingStyleSheets:supportsAdoptingStyleSheets,CSSResult:CSSResult,unsafeCSS:unsafeCSS,css:css};/**
    * @license
    * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    * This code may only be used under the BSD style license found at
    * http://polymer.github.io/LICENSE.txt
    * The complete set of authors may be found at
    * http://polymer.github.io/AUTHORS.txt
    * The complete set of contributors may be found at
    * http://polymer.github.io/CONTRIBUTORS.txt
    * Code distributed by Google as part of the polymer project is also
    * subject to an additional IP rights grant found at
    * http://polymer.github.io/PATENTS.txt
    */const legacyCustomElement=(tagName,clazz)=>{window.customElements.define(tagName,clazz);// Cast as any because TS doesn't recognize the return type as being a
// subtype of the decorated class when clazz is typed as
// `Constructor<HTMLElement>` for some reason.
// `Constructor<HTMLElement>` is helpful to make sure the decorator is
// applied to elements however.
// tslint:disable-next-line:no-any
return clazz},standardCustomElement=(tagName,descriptor)=>{const{kind,elements}=descriptor;return{kind,elements,// This callback is called once the class is otherwise fully defined
finisher(clazz){window.customElements.define(tagName,clazz)}}},customElement=tagName=>classOrDescriptor=>"function"===typeof classOrDescriptor?legacyCustomElement(tagName,classOrDescriptor):standardCustomElement(tagName,classOrDescriptor),standardProperty=(options,element)=>{// When decorating an accessor, pass it through and add property metadata.
// Note, the `hasOwnProperty` check in `createProperty` ensures we don't
// stomp over the user's accessor.
if("method"===element.kind&&element.descriptor&&!("value"in element.descriptor)){return Object.assign({},element,{finisher(clazz){clazz.createProperty(element.key,options)}})}else{// createProperty() takes care of defining the property, but we still
// must return some kind of descriptor, so return a descriptor for an
// unused prototype field. The finisher calls createProperty().
return{kind:"field",key:Symbol(),placement:"own",descriptor:{},// When @babel/plugin-proposal-decorators implements initializers,
// do this instead of the initializer below. See:
// https://github.com/babel/babel/issues/9260 extras: [
//   {
//     kind: 'initializer',
//     placement: 'own',
//     initializer: descriptor.initializer,
//   }
// ],
initializer(){if("function"===typeof element.initializer){this[element.key]=element.initializer.call(this)}},finisher(clazz){clazz.createProperty(element.key,options)}}}},legacyProperty=(options,proto,name)=>{proto.constructor.createProperty(name,options)};/**
    * A property decorator which creates a LitElement property which reflects a
    * corresponding attribute value. A `PropertyDeclaration` may optionally be
    * supplied to configure property features.
    *
    * @ExportDecoratedItems
    */function property(options){// tslint:disable-next-line:no-any decorator
return(protoOrDescriptor,name)=>name!==void 0?legacyProperty(options,protoOrDescriptor,name):standardProperty(options,protoOrDescriptor)}/**
   * A property decorator that converts a class property into a getter that
   * executes a querySelector on the element's renderRoot.
   *
   * @ExportDecoratedItems
   */function query(selector){return(protoOrDescriptor,// tslint:disable-next-line:no-any decorator
name)=>{const descriptor={get(){return this.renderRoot.querySelector(selector)},enumerable:!0,configurable:!0};return name!==void 0?legacyQuery(descriptor,protoOrDescriptor,name):standardQuery(descriptor,protoOrDescriptor)}}/**
   * A property decorator that converts a class property into a getter
   * that executes a querySelectorAll on the element's renderRoot.
   *
   * @ExportDecoratedItems
   */function queryAll(selector){return(protoOrDescriptor,// tslint:disable-next-line:no-any decorator
name)=>{const descriptor={get(){return this.renderRoot.querySelectorAll(selector)},enumerable:!0,configurable:!0};return name!==void 0?legacyQuery(descriptor,protoOrDescriptor,name):standardQuery(descriptor,protoOrDescriptor)}}const legacyQuery=(descriptor,proto,name)=>{Object.defineProperty(proto,name,descriptor)},standardQuery=(descriptor,element)=>({kind:"method",placement:"prototype",key:element.key,descriptor}),standardEventOptions=(options,element)=>{return Object.assign({},element,{finisher(clazz){Object.assign(clazz.prototype[element.key],options)}})},legacyEventOptions=// tslint:disable-next-line:no-any legacy decorator
(options,proto,name)=>{Object.assign(proto[name],options)},eventOptions=options=>// Return value typed as any to prevent TypeScript from complaining that
// standard decorator function signature does not match TypeScript decorator
// signature
// TODO(kschaaf): unclear why it was only failing on this decorator and not
// the others
(protoOrDescriptor,name)=>name!==void 0?legacyEventOptions(options,protoOrDescriptor,name):standardEventOptions(options,protoOrDescriptor);var decorators={customElement:customElement,property:property,query:query,queryAll:queryAll,eventOptions:eventOptions};/**
    * @license
    * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    * This code may only be used under the BSD style license found at
    * http://polymer.github.io/LICENSE.txt
    * The complete set of authors may be found at
    * http://polymer.github.io/AUTHORS.txt
    * The complete set of contributors may be found at
    * http://polymer.github.io/CONTRIBUTORS.txt
    * Code distributed by Google as part of the polymer project is also
    * subject to an additional IP rights grant found at
    * http://polymer.github.io/PATENTS.txt
    */ /**
        * When using Closure Compiler, JSCompiler_renameProperty(property, object) is
        * replaced at compile time by the munged name for object[property]. We cannot
        * alias this function, so we have to use a small shim that has the same
        * behavior when not compiling.
        */window.JSCompiler_renameProperty=(prop,_obj)=>prop;const defaultConverter={toAttribute(value,type){switch(type){case Boolean:return value?"":null;case Object:case Array:// if the value is `null` or `undefined` pass this through
// to allow removing/no change behavior.
return null==value?value:JSON.stringify(value);}return value},fromAttribute(value,type){switch(type){case Boolean:return null!==value;case Number:return null===value?null:+value;case Object:case Array:return JSON.parse(value);}return value}},notEqual=(value,old)=>{// This ensures (old==NaN, value==NaN) always returns false
return old!==value&&(old===old||value===value)},defaultPropertyDeclaration={attribute:!0,type:String,converter:defaultConverter,reflect:!1,hasChanged:notEqual},microtaskPromise=Promise.resolve(!0),STATE_HAS_UPDATED=1,STATE_UPDATE_REQUESTED=1<<2,STATE_IS_REFLECTING_TO_ATTRIBUTE=1<<3,STATE_IS_REFLECTING_TO_PROPERTY=1<<4,STATE_HAS_CONNECTED=1<<5;/**
    * Change function that returns true if `value` is different from `oldValue`.
    * This method is used as the default for a property's `hasChanged` function.
    */ /**
                                     * Base element class which manages element properties and attributes. When
                                     * properties change, the `update` method is asynchronously called. This method
                                     * should be supplied by subclassers to render updates as desired.
                                     */class UpdatingElement extends HTMLElement{constructor(){super();this._updateState=0;this._instanceProperties=void 0;this._updatePromise=microtaskPromise;this._hasConnectedResolver=void 0;/**
                                             * Map with keys for any properties that have changed since the last
                                             * update cycle with previous values.
                                             */this._changedProperties=new Map;/**
                                          * Map with keys of properties that should be reflected when updated.
                                          */this._reflectingProperties=void 0;this.initialize()}/**
     * Returns a list of attributes corresponding to the registered properties.
     * @nocollapse
     */static get observedAttributes(){// note: piggy backing on this to ensure we're finalized.
this.finalize();const attributes=[];// Use forEach so this works even if for/of loops are compiled to for loops
// expecting arrays
this._classProperties.forEach((v,p)=>{const attr=this._attributeNameForProperty(p,v);if(attr!==void 0){this._attributeToPropertyMap.set(attr,p);attributes.push(attr)}});return attributes}/**
     * Ensures the private `_classProperties` property metadata is created.
     * In addition to `finalize` this is also called in `createProperty` to
     * ensure the `@property` decorator can add property metadata.
     */ /** @nocollapse */static _ensureClassProperties(){// ensure private storage for property declarations.
if(!this.hasOwnProperty(JSCompiler_renameProperty("_classProperties",this))){this._classProperties=new Map;// NOTE: Workaround IE11 not supporting Map constructor argument.
const superProperties=Object.getPrototypeOf(this)._classProperties;if(superProperties!==void 0){superProperties.forEach((v,k)=>this._classProperties.set(k,v))}}}/**
     * Creates a property accessor on the element prototype if one does not exist.
     * The property setter calls the property's `hasChanged` property option
     * or uses a strict identity check to determine whether or not to request
     * an update.
     * @nocollapse
     */static createProperty(name,options=defaultPropertyDeclaration){// Note, since this can be called by the `@property` decorator which
// is called before `finalize`, we ensure storage exists for property
// metadata.
this._ensureClassProperties();this._classProperties.set(name,options);// Do not generate an accessor if the prototype already has one, since
// it would be lost otherwise and that would never be the user's intention;
// Instead, we expect users to call `requestUpdate` themselves from
// user-defined accessors. Note that if the super has an accessor we will
// still overwrite it
if(options.noAccessor||this.prototype.hasOwnProperty(name)){return}const key="symbol"===typeof name?Symbol():`__${name}`;Object.defineProperty(this.prototype,name,{// tslint:disable-next-line:no-any no symbol in index
get(){return this[key]},set(value){const oldValue=this[name];this[key]=value;this._requestUpdate(name,oldValue)},configurable:!0,enumerable:!0})}/**
     * Creates property accessors for registered properties and ensures
     * any superclasses are also finalized.
     * @nocollapse
     */static finalize(){if(this.hasOwnProperty(JSCompiler_renameProperty("finalized",this))&&this.finalized){return}// finalize any superclasses
const superCtor=Object.getPrototypeOf(this);if("function"===typeof superCtor.finalize){superCtor.finalize()}this.finalized=!0;this._ensureClassProperties();// initialize Map populated in observedAttributes
this._attributeToPropertyMap=new Map;// make any properties
// Note, only process "own" properties since this element will inherit
// any properties defined on the superClass, and finalization ensures
// the entire prototype chain is finalized.
if(this.hasOwnProperty(JSCompiler_renameProperty("properties",this))){const props=this.properties,propKeys=[...Object.getOwnPropertyNames(props),...("function"===typeof Object.getOwnPropertySymbols?Object.getOwnPropertySymbols(props):[])];// support symbols in properties (IE11 does not support this)
// This for/of is ok because propKeys is an array
for(const p of propKeys){// note, use of `any` is due to TypeSript lack of support for symbol in
// index types
// tslint:disable-next-line:no-any no symbol in index
this.createProperty(p,props[p])}}}/**
     * Returns the property name for the given attribute `name`.
     * @nocollapse
     */static _attributeNameForProperty(name,options){const attribute=options.attribute;return!1===attribute?void 0:"string"===typeof attribute?attribute:"string"===typeof name?name.toLowerCase():void 0}/**
     * Returns true if a property should request an update.
     * Called when a property value is set and uses the `hasChanged`
     * option for the property if present or a strict identity check.
     * @nocollapse
     */static _valueHasChanged(value,old,hasChanged=notEqual){return hasChanged(value,old)}/**
     * Returns the property value for the given attribute value.
     * Called via the `attributeChangedCallback` and uses the property's
     * `converter` or `converter.fromAttribute` property option.
     * @nocollapse
     */static _propertyValueFromAttribute(value,options){const type=options.type,converter=options.converter||defaultConverter,fromAttribute="function"===typeof converter?converter:converter.fromAttribute;return fromAttribute?fromAttribute(value,type):value}/**
     * Returns the attribute value for the given property value. If this
     * returns undefined, the property will *not* be reflected to an attribute.
     * If this returns null, the attribute will be removed, otherwise the
     * attribute will be set to the value.
     * This uses the property's `reflect` and `type.toAttribute` property options.
     * @nocollapse
     */static _propertyValueToAttribute(value,options){if(options.reflect===void 0){return}const type=options.type,converter=options.converter,toAttribute=converter&&converter.toAttribute||defaultConverter.toAttribute;return toAttribute(value,type)}/**
     * Performs element initialization. By default captures any pre-set values for
     * registered properties.
     */initialize(){this._saveInstanceProperties();// ensures first update will be caught by an early access of
// `updateComplete`
this._requestUpdate()}/**
     * Fixes any properties set on the instance before upgrade time.
     * Otherwise these would shadow the accessor and break these properties.
     * The properties are stored in a Map which is played back after the
     * constructor runs. Note, on very old versions of Safari (<=9) or Chrome
     * (<=41), properties created for native platform properties like (`id` or
     * `name`) may not have default values set in the element constructor. On
     * these browsers native properties appear on instances and therefore their
     * default value will overwrite any element default (e.g. if the element sets
     * this.id = 'id' in the constructor, the 'id' will become '' since this is
     * the native platform default).
     */_saveInstanceProperties(){// Use forEach so this works even if for/of loops are compiled to for loops
// expecting arrays
this.constructor._classProperties.forEach((_v,p)=>{if(this.hasOwnProperty(p)){const value=this[p];delete this[p];if(!this._instanceProperties){this._instanceProperties=new Map}this._instanceProperties.set(p,value)}})}/**
     * Applies previously saved instance properties.
     */_applyInstanceProperties(){// Use forEach so this works even if for/of loops are compiled to for loops
// expecting arrays
// tslint:disable-next-line:no-any
this._instanceProperties.forEach((v,p)=>this[p]=v);this._instanceProperties=void 0}connectedCallback(){this._updateState=this._updateState|STATE_HAS_CONNECTED;// Ensure first connection completes an update. Updates cannot complete
// before connection and if one is pending connection the
// `_hasConnectionResolver` will exist. If so, resolve it to complete the
// update, otherwise requestUpdate.
if(this._hasConnectedResolver){this._hasConnectedResolver();this._hasConnectedResolver=void 0}}/**
     * Allows for `super.disconnectedCallback()` in extensions while
     * reserving the possibility of making non-breaking feature additions
     * when disconnecting at some point in the future.
     */disconnectedCallback(){}/**
                             * Synchronizes property values when attributes change.
                             */attributeChangedCallback(name,old,value){if(old!==value){this._attributeToProperty(name,value)}}_propertyToAttribute(name,value,options=defaultPropertyDeclaration){const ctor=this.constructor,attr=ctor._attributeNameForProperty(name,options);if(attr!==void 0){const attrValue=ctor._propertyValueToAttribute(value,options);// an undefined value does not change the attribute.
if(attrValue===void 0){return}// Track if the property is being reflected to avoid
// setting the property again via `attributeChangedCallback`. Note:
// 1. this takes advantage of the fact that the callback is synchronous.
// 2. will behave incorrectly if multiple attributes are in the reaction
// stack at time of calling. However, since we process attributes
// in `update` this should not be possible (or an extreme corner case
// that we'd like to discover).
// mark state reflecting
this._updateState=this._updateState|STATE_IS_REFLECTING_TO_ATTRIBUTE;if(null==attrValue){this.removeAttribute(attr)}else{this.setAttribute(attr,attrValue)}// mark state not reflecting
this._updateState=this._updateState&~STATE_IS_REFLECTING_TO_ATTRIBUTE}}_attributeToProperty(name,value){// Use tracking info to avoid deserializing attribute value if it was
// just set from a property setter.
if(this._updateState&STATE_IS_REFLECTING_TO_ATTRIBUTE){return}const ctor=this.constructor,propName=ctor._attributeToPropertyMap.get(name);if(propName!==void 0){const options=ctor._classProperties.get(propName)||defaultPropertyDeclaration;// mark state reflecting
this._updateState=this._updateState|STATE_IS_REFLECTING_TO_PROPERTY;this[propName]=// tslint:disable-next-line:no-any
ctor._propertyValueFromAttribute(value,options);// mark state not reflecting
this._updateState=this._updateState&~STATE_IS_REFLECTING_TO_PROPERTY}}/**
     * This private version of `requestUpdate` does not access or return the
     * `updateComplete` promise. This promise can be overridden and is therefore
     * not free to access.
     */_requestUpdate(name,oldValue){let shouldRequestUpdate=!0;// If we have a property key, perform property update steps.
if(name!==void 0){const ctor=this.constructor,options=ctor._classProperties.get(name)||defaultPropertyDeclaration;if(ctor._valueHasChanged(this[name],oldValue,options.hasChanged)){if(!this._changedProperties.has(name)){this._changedProperties.set(name,oldValue)}// Add to reflecting properties set.
// Note, it's important that every change has a chance to add the
// property to `_reflectingProperties`. This ensures setting
// attribute + property reflects correctly.
if(!0===options.reflect&&!(this._updateState&STATE_IS_REFLECTING_TO_PROPERTY)){if(this._reflectingProperties===void 0){this._reflectingProperties=new Map}this._reflectingProperties.set(name,options)}}else{// Abort the request if the property should not be considered changed.
shouldRequestUpdate=!1}}if(!this._hasRequestedUpdate&&shouldRequestUpdate){this._enqueueUpdate()}}/**
     * Requests an update which is processed asynchronously. This should
     * be called when an element should update based on some state not triggered
     * by setting a property. In this case, pass no arguments. It should also be
     * called when manually implementing a property setter. In this case, pass the
     * property `name` and `oldValue` to ensure that any configured property
     * options are honored. Returns the `updateComplete` Promise which is resolved
     * when the update completes.
     *
     * @param name {PropertyKey} (optional) name of requesting property
     * @param oldValue {any} (optional) old value of requesting property
     * @returns {Promise} A Promise that is resolved when the update completes.
     */requestUpdate(name,oldValue){this._requestUpdate(name,oldValue);return this.updateComplete}/**
     * Sets up the element to asynchronously update.
     */async _enqueueUpdate(){// Mark state updating...
this._updateState=this._updateState|STATE_UPDATE_REQUESTED;let resolve,reject;const previousUpdatePromise=this._updatePromise;this._updatePromise=new Promise((res,rej)=>{resolve=res;reject=rej});try{// Ensure any previous update has resolved before updating.
// This `await` also ensures that property changes are batched.
await previousUpdatePromise}catch(e){}// Ignore any previous errors. We only care that the previous cycle is
// done. Any error should have been handled in the previous update.
// Make sure the element has connected before updating.
if(!this._hasConnected){await new Promise(res=>this._hasConnectedResolver=res)}try{const result=this.performUpdate();// If `performUpdate` returns a Promise, we await it. This is done to
// enable coordinating updates with a scheduler. Note, the result is
// checked to avoid delaying an additional microtask unless we need to.
if(null!=result){await result}}catch(e){reject(e)}resolve(!this._hasRequestedUpdate)}get _hasConnected(){return this._updateState&STATE_HAS_CONNECTED}get _hasRequestedUpdate(){return this._updateState&STATE_UPDATE_REQUESTED}get hasUpdated(){return this._updateState&STATE_HAS_UPDATED}/**
     * Performs an element update. Note, if an exception is thrown during the
     * update, `firstUpdated` and `updated` will not be called.
     *
     * You can override this method to change the timing of updates. If this
     * method is overridden, `super.performUpdate()` must be called.
     *
     * For instance, to schedule updates to occur just before the next frame:
     *
     * ```
     * protected async performUpdate(): Promise<unknown> {
     *   await new Promise((resolve) => requestAnimationFrame(() => resolve()));
     *   super.performUpdate();
     * }
     * ```
     */performUpdate(){// Mixin instance properties once, if they exist.
if(this._instanceProperties){this._applyInstanceProperties()}let shouldUpdate=!1;const changedProperties=this._changedProperties;try{shouldUpdate=this.shouldUpdate(changedProperties);if(shouldUpdate){this.update(changedProperties)}}catch(e){// Prevent `firstUpdated` and `updated` from running when there's an
// update exception.
shouldUpdate=!1;throw e}finally{// Ensure element can accept additional updates after an exception.
this._markUpdated()}if(shouldUpdate){if(!(this._updateState&STATE_HAS_UPDATED)){this._updateState=this._updateState|STATE_HAS_UPDATED;this.firstUpdated(changedProperties)}this.updated(changedProperties)}}_markUpdated(){this._changedProperties=new Map;this._updateState=this._updateState&~STATE_UPDATE_REQUESTED}/**
     * Returns a Promise that resolves when the element has completed updating.
     * The Promise value is a boolean that is `true` if the element completed the
     * update without triggering another update. The Promise result is `false` if
     * a property was set inside `updated()`. If the Promise is rejected, an
     * exception was thrown during the update. This getter can be implemented to
     * await additional state. For example, it is sometimes useful to await a
     * rendered element before fulfilling this Promise. To do this, first await
     * `super.updateComplete` then any subsequent state.
     *
     * @returns {Promise} The Promise returns a boolean that indicates if the
     * update resolved without triggering another update.
     */get updateComplete(){return this._updatePromise}/**
     * Controls whether or not `update` should be called when the element requests
     * an update. By default, this method always returns `true`, but this can be
     * customized to control when to update.
     *
     * * @param _changedProperties Map of changed properties with old values
     */shouldUpdate(_changedProperties){return!0}/**
     * Updates the element. This method reflects property values to attributes.
     * It can be overridden to render and keep updated element DOM.
     * Setting properties inside this method will *not* trigger
     * another update.
     *
     * * @param _changedProperties Map of changed properties with old values
     */update(_changedProperties){if(this._reflectingProperties!==void 0&&0<this._reflectingProperties.size){// Use forEach so this works even if for/of loops are compiled to for
// loops expecting arrays
this._reflectingProperties.forEach((v,k)=>this._propertyToAttribute(k,this[k],v));this._reflectingProperties=void 0}}/**
     * Invoked whenever the element is updated. Implement to perform
     * post-updating tasks via DOM APIs, for example, focusing an element.
     *
     * Setting properties inside this method will trigger the element to update
     * again after this update cycle completes.
     *
     * * @param _changedProperties Map of changed properties with old values
     */updated(_changedProperties){}/**
                                  * Invoked when the element is first updated. Implement to perform one time
                                  * work on the element after update.
                                  *
                                  * Setting properties inside this method will trigger the element to update
                                  * again after this update cycle completes.
                                  *
                                  * * @param _changedProperties Map of changed properties with old values
                                  */firstUpdated(_changedProperties){}}/**
   * Marks class as having finished creating properties.
   */UpdatingElement.finalized=!0;var updatingElement={defaultConverter:defaultConverter,notEqual:notEqual,UpdatingElement:UpdatingElement};/**
    * @license
    * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    * This code may only be used under the BSD style license found at
    * http://polymer.github.io/LICENSE.txt
    * The complete set of authors may be found at
    * http://polymer.github.io/AUTHORS.txt
    * The complete set of contributors may be found at
    * http://polymer.github.io/CONTRIBUTORS.txt
    * Code distributed by Google as part of the polymer project is also
    * subject to an additional IP rights grant found at
    * http://polymer.github.io/PATENTS.txt
    */const directives=new WeakMap,directive=f=>(...args)=>{const d=f(...args);directives.set(d,!0);return d},isDirective=o=>{return"function"===typeof o&&directives.has(o)};/**
                                   * Brands a function as a directive factory function so that lit-html will call
                                   * the function during template rendering, rather than passing as a value.
                                   *
                                   * A _directive_ is a function that takes a Part as an argument. It has the
                                   * signature: `(part: Part) => void`.
                                   *
                                   * A directive _factory_ is a function that takes arguments for data and
                                   * configuration and returns a directive. Users of directive usually refer to
                                   * the directive factory as the directive. For example, "The repeat directive".
                                   *
                                   * Usually a template author will invoke a directive factory in their template
                                   * with relevant arguments, which will then return a directive function.
                                   *
                                   * Here's an example of using the `repeat()` directive factory that takes an
                                   * array and a function to render an item:
                                   *
                                   * ```js
                                   * html`<ul><${repeat(items, (item) => html`<li>${item}</li>`)}</ul>`
                                   * ```
                                   *
                                   * When `repeat` is invoked, it returns a directive function that closes over
                                   * `items` and the template function. When the outer template is rendered, the
                                   * return directive function is called with the Part for the expression.
                                   * `repeat` then performs it's custom logic to render multiple items.
                                   *
                                   * @param f The directive factory function. Must be a function that returns a
                                   * function of the signature `(part: Part) => void`. The returned function will
                                   * be called with the part object.
                                   *
                                   * @example
                                   *
                                   * import {directive, html} from 'lit-html';
                                   *
                                   * const immutable = directive((v) => (part) => {
                                   *   if (part.value !== v) {
                                   *     part.setValue(v)
                                   *   }
                                   * });
                                   */var directive$1={directive:directive,isDirective:isDirective};/**
    * @license
    * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    * This code may only be used under the BSD style license found at
    * http://polymer.github.io/LICENSE.txt
    * The complete set of authors may be found at
    * http://polymer.github.io/AUTHORS.txt
    * The complete set of contributors may be found at
    * http://polymer.github.io/CONTRIBUTORS.txt
    * Code distributed by Google as part of the polymer project is also
    * subject to an additional IP rights grant found at
    * http://polymer.github.io/PATENTS.txt
    */ /**
        * True if the custom elements polyfill is in use.
        */const isCEPolyfill=window.customElements!==void 0&&window.customElements.polyfillWrapFlushCallback!==void 0,reparentNodes=(container,start,end=null,before=null)=>{while(start!==end){const n=start.nextSibling;container.insertBefore(start,before);start=n}},removeNodes=(container,start,end=null)=>{while(start!==end){const n=start.nextSibling;container.removeChild(start);start=n}};/**
                                                                                                                                   * Reparents nodes, starting from `start` (inclusive) to `end` (exclusive),
                                                                                                                                   * into another container (could be the same container), before `before`. If
                                                                                                                                   * `before` is null, it appends the nodes to the container.
                                                                                                                                   */var dom={isCEPolyfill:isCEPolyfill,reparentNodes:reparentNodes,removeNodes:removeNodes};/**
    * @license
    * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
    * This code may only be used under the BSD style license found at
    * http://polymer.github.io/LICENSE.txt
    * The complete set of authors may be found at
    * http://polymer.github.io/AUTHORS.txt
    * The complete set of contributors may be found at
    * http://polymer.github.io/CONTRIBUTORS.txt
    * Code distributed by Google as part of the polymer project is also
    * subject to an additional IP rights grant found at
    * http://polymer.github.io/PATENTS.txt
    */ /**
        * A sentinel value that signals that a value was handled by a directive and
        * should not be written to the DOM.
        */const noChange={},nothing={};/**
                             * A sentinel value that signals a NodePart to fully clear its content.
                             */var part={noChange:noChange,nothing:nothing};/**
    * @license
    * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    * This code may only be used under the BSD style license found at
    * http://polymer.github.io/LICENSE.txt
    * The complete set of authors may be found at
    * http://polymer.github.io/AUTHORS.txt
    * The complete set of contributors may be found at
    * http://polymer.github.io/CONTRIBUTORS.txt
    * Code distributed by Google as part of the polymer project is also
    * subject to an additional IP rights grant found at
    * http://polymer.github.io/PATENTS.txt
    */ /**
        * An expression marker with embedded unique key to avoid collision with
        * possible text in templates.
        */const marker=`{{lit-${(Math.random()+"").slice(2)}}}`,nodeMarker=`<!--${marker}-->`,markerRegex=new RegExp(`${marker}|${nodeMarker}`),boundAttributeSuffix="$lit$";/**
                                                                    * An expression marker used text-positions, multi-binding attributes, and
                                                                    * attributes with markup-like text values.
                                                                    */ /**
                                              * An updateable Template that tracks the location of dynamic parts.
                                              */class Template{constructor(result,element){this.parts=[];this.element=element;const nodesToRemove=[],stack=[],walker=document.createTreeWalker(element.content,133/* NodeFilter.SHOW_{ELEMENT|COMMENT|TEXT} */,null,!1);// Keeps track of the last index associated with a part. We try to delete
// unnecessary nodes, but we never want to associate two different parts
// to the same index. They must have a constant node between.
let lastPartIndex=0,index=-1,partIndex=0;const{strings,values:{length}}=result;while(partIndex<length){const node=walker.nextNode();if(null===node){// We've exhausted the content inside a nested template element.
// Because we still have parts (the outer for-loop), we know:
// - There is a template in the stack
// - The walker will find a nextNode outside the template
walker.currentNode=stack.pop();continue}index++;if(1===node.nodeType/* Node.ELEMENT_NODE */){if(node.hasAttributes()){const attributes=node.attributes,{length}=attributes;// Per
// https://developer.mozilla.org/en-US/docs/Web/API/NamedNodeMap,
// attributes are not guaranteed to be returned in document order.
// In particular, Edge/IE can return them out of order, so we cannot
// assume a correspondence between part index and attribute index.
let count=0;for(let i=0;i<length;i++){if(endsWith(attributes[i].name,boundAttributeSuffix)){count++}}while(0<count--){// Get the template literal section leading up to the first
// expression in this attribute
const stringForPart=strings[partIndex],name=lastAttributeNameRegex.exec(stringForPart)[2],attributeLookupName=name.toLowerCase()+boundAttributeSuffix,attributeValue=node.getAttribute(attributeLookupName);// Find the attribute name
node.removeAttribute(attributeLookupName);const statics=attributeValue.split(markerRegex);this.parts.push({type:"attribute",index,name,strings:statics});partIndex+=statics.length-1}}if("TEMPLATE"===node.tagName){stack.push(node);walker.currentNode=node.content}}else if(3===node.nodeType/* Node.TEXT_NODE */){const data=node.data;if(0<=data.indexOf(marker)){const parent=node.parentNode,strings=data.split(markerRegex),lastIndex=strings.length-1;// Generate a new text node for each literal section
// These nodes are also used as the markers for node parts
for(let i=0;i<lastIndex;i++){let insert,s=strings[i];if(""===s){insert=createMarker()}else{const match=lastAttributeNameRegex.exec(s);if(null!==match&&endsWith(match[2],boundAttributeSuffix)){s=s.slice(0,match.index)+match[1]+match[2].slice(0,-boundAttributeSuffix.length)+match[3]}insert=document.createTextNode(s)}parent.insertBefore(insert,node);this.parts.push({type:"node",index:++index})}// If there's no text, we must insert a comment to mark our place.
// Else, we can trust it will stick around after cloning.
if(""===strings[lastIndex]){parent.insertBefore(createMarker(),node);nodesToRemove.push(node)}else{node.data=strings[lastIndex]}// We have a part for each match found
partIndex+=lastIndex}}else if(8===node.nodeType/* Node.COMMENT_NODE */){if(node.data===marker){const parent=node.parentNode;// Add a new marker node to be the startNode of the Part if any of
// the following are true:
//  * We don't have a previousSibling
//  * The previousSibling is already the start of a previous part
if(null===node.previousSibling||index===lastPartIndex){index++;parent.insertBefore(createMarker(),node)}lastPartIndex=index;this.parts.push({type:"node",index});// If we don't have a nextSibling, keep this node so we have an end.
// Else, we can remove it to save future costs.
if(null===node.nextSibling){node.data=""}else{nodesToRemove.push(node);index--}partIndex++}else{let i=-1;while(-1!==(i=node.data.indexOf(marker,i+1))){// Comment node has a binding marker inside, make an inactive part
// The binding won't work, but subsequent bindings will
// TODO (justinfagnani): consider whether it's even worth it to
// make bindings in comments work
this.parts.push({type:"node",index:-1});partIndex++}}}}// Remove text binding nodes after the walk to not disturb the TreeWalker
for(const n of nodesToRemove){n.parentNode.removeChild(n)}}}const endsWith=(str,suffix)=>{const index=str.length-suffix.length;return 0<=index&&str.slice(index)===suffix},isTemplatePartActive=part=>-1!==part.index,createMarker=()=>document.createComment(""),lastAttributeNameRegex=/([ \x09\x0a\x0c\x0d])([^\0-\x1F\x7F-\x9F "'>=/]+)([ \x09\x0a\x0c\x0d]*=[ \x09\x0a\x0c\x0d]*(?:[^ \x09\x0a\x0c\x0d"'`<>=]*|"[^"]*|'[^']*))$/;var template={marker:marker,nodeMarker:nodeMarker,markerRegex:markerRegex,boundAttributeSuffix:boundAttributeSuffix,Template:Template,isTemplatePartActive:isTemplatePartActive,createMarker:createMarker,lastAttributeNameRegex:lastAttributeNameRegex};class TemplateInstance{constructor(template,processor,options){this.__parts=[];this.template=template;this.processor=processor;this.options=options}update(values){let i=0;for(const part of this.__parts){if(part!==void 0){part.setValue(values[i])}i++}for(const part of this.__parts){if(part!==void 0){part.commit()}}}_clone(){// There are a number of steps in the lifecycle of a template instance's
// DOM fragment:
//  1. Clone - create the instance fragment
//  2. Adopt - adopt into the main document
//  3. Process - find part markers and create parts
//  4. Upgrade - upgrade custom elements
//  5. Update - set node, attribute, property, etc., values
//  6. Connect - connect to the document. Optional and outside of this
//     method.
//
// We have a few constraints on the ordering of these steps:
//  * We need to upgrade before updating, so that property values will pass
//    through any property setters.
//  * We would like to process before upgrading so that we're sure that the
//    cloned fragment is inert and not disturbed by self-modifying DOM.
//  * We want custom elements to upgrade even in disconnected fragments.
//
// Given these constraints, with full custom elements support we would
// prefer the order: Clone, Process, Adopt, Upgrade, Update, Connect
//
// But Safari dooes not implement CustomElementRegistry#upgrade, so we
// can not implement that order and still have upgrade-before-update and
// upgrade disconnected fragments. So we instead sacrifice the
// process-before-upgrade constraint, since in Custom Elements v1 elements
// must not modify their light DOM in the constructor. We still have issues
// when co-existing with CEv0 elements like Polymer 1, and with polyfills
// that don't strictly adhere to the no-modification rule because shadow
// DOM, which may be created in the constructor, is emulated by being placed
// in the light DOM.
//
// The resulting order is on native is: Clone, Adopt, Upgrade, Process,
// Update, Connect. document.importNode() performs Clone, Adopt, and Upgrade
// in one step.
//
// The Custom Elements v1 polyfill supports upgrade(), so the order when
// polyfilled is the more ideal: Clone, Process, Adopt, Upgrade, Update,
// Connect.
const fragment=isCEPolyfill?this.template.element.content.cloneNode(!0):document.importNode(this.template.element.content,!0),stack=[],parts=this.template.parts,walker=document.createTreeWalker(fragment,133/* NodeFilter.SHOW_{ELEMENT|COMMENT|TEXT} */,null,!1);let partIndex=0,nodeIndex=0,part,node=walker.nextNode();// Loop through all the nodes and parts of a template
while(partIndex<parts.length){part=parts[partIndex];if(!isTemplatePartActive(part)){this.__parts.push(void 0);partIndex++;continue}// Progress the tree walker until we find our next part's node.
// Note that multiple parts may share the same node (attribute parts
// on a single element), so this loop may not run at all.
while(nodeIndex<part.index){nodeIndex++;if("TEMPLATE"===node.nodeName){stack.push(node);walker.currentNode=node.content}if(null===(node=walker.nextNode())){// We've exhausted the content inside a nested template element.
// Because we still have parts (the outer for-loop), we know:
// - There is a template in the stack
// - The walker will find a nextNode outside the template
walker.currentNode=stack.pop();node=walker.nextNode()}}// We've arrived at our part's node.
if("node"===part.type){const part=this.processor.handleTextExpression(this.options);part.insertAfterNode(node.previousSibling);this.__parts.push(part)}else{this.__parts.push(...this.processor.handleAttributeExpressions(node,part.name,part.strings,this.options))}partIndex++}if(isCEPolyfill){document.adoptNode(fragment);customElements.upgrade(fragment)}return fragment}}var templateInstance={TemplateInstance:TemplateInstance};class TemplateResult{constructor(strings,values,type,processor){this.strings=strings;this.values=values;this.type=type;this.processor=processor}/**
     * Returns a string of HTML used to create a `<template>` element.
     */getHTML(){const l=this.strings.length-1;let html="",isCommentBinding=!1;for(let i=0;i<l;i++){const s=this.strings[i],commentOpen=s.lastIndexOf("<!--");// For each binding we want to determine the kind of marker to insert
// into the template source before it's parsed by the browser's HTML
// parser. The marker type is based on whether the expression is in an
// attribute, text, or comment poisition.
//   * For node-position bindings we insert a comment with the marker
//     sentinel as its text content, like <!--{{lit-guid}}-->.
//   * For attribute bindings we insert just the marker sentinel for the
//     first binding, so that we support unquoted attribute bindings.
//     Subsequent bindings can use a comment marker because multi-binding
//     attributes must be quoted.
//   * For comment bindings we insert just the marker sentinel so we don't
//     close the comment.
//
// The following code scans the template source, but is *not* an HTML
// parser. We don't need to track the tree structure of the HTML, only
// whether a binding is inside a comment, and if not, if it appears to be
// the first binding in an attribute.
// We're in comment position if we have a comment open with no following
// comment close. Because <-- can appear in an attribute value there can
// be false positives.
isCommentBinding=(-1<commentOpen||isCommentBinding)&&-1===s.indexOf("-->",commentOpen+1);// Check to see if we have an attribute-like sequence preceeding the
// expression. This can match "name=value" like structures in text,
// comments, and attribute values, so there can be false-positives.
const attributeMatch=lastAttributeNameRegex.exec(s);if(null===attributeMatch){// We're only in this branch if we don't have a attribute-like
// preceeding sequence. For comments, this guards against unusual
// attribute values like <div foo="<!--${'bar'}">. Cases like
// <!-- foo=${'bar'}--> are handled correctly in the attribute branch
// below.
html+=s+(isCommentBinding?marker:nodeMarker)}else{// For attributes we use just a marker sentinel, and also append a
// $lit$ suffix to the name to opt-out of attribute-specific parsing
// that IE and Edge do for style and certain SVG attributes.
html+=s.substr(0,attributeMatch.index)+attributeMatch[1]+attributeMatch[2]+boundAttributeSuffix+attributeMatch[3]+marker}}html+=this.strings[l];return html}getTemplateElement(){const template=document.createElement("template");template.innerHTML=this.getHTML();return template}}/**
   * A TemplateResult for SVG fragments.
   *
   * This class wraps HTML in an `<svg>` tag in order to parse its contents in the
   * SVG namespace, then modifies the template to remove the `<svg>` tag so that
   * clones only container the original fragment.
   */class SVGTemplateResult extends TemplateResult{getHTML(){return`<svg>${super.getHTML()}</svg>`}getTemplateElement(){const template=super.getTemplateElement(),content=template.content,svgElement=content.firstChild;content.removeChild(svgElement);reparentNodes(content,svgElement.firstChild);return template}}var templateResult={TemplateResult:TemplateResult,SVGTemplateResult:SVGTemplateResult};const isPrimitive=value=>{return null===value||!("object"===typeof value||"function"===typeof value)},isIterable=value=>{return Array.isArray(value)||// tslint:disable-next-line:no-any
!!(value&&value[Symbol.iterator])};/**
    * Writes attribute values to the DOM for a group of AttributeParts bound to a
    * single attibute. The value is only set once even if there are multiple parts
    * for an attribute.
    */class AttributeCommitter{constructor(element,name,strings){this.dirty=!0;this.element=element;this.name=name;this.strings=strings;this.parts=[];for(let i=0;i<strings.length-1;i++){this.parts[i]=this._createPart()}}/**
     * Creates a single part. Override this to create a differnt type of part.
     */_createPart(){return new AttributePart(this)}_getValue(){const strings=this.strings,l=strings.length-1;let text="";for(let i=0;i<l;i++){text+=strings[i];const part=this.parts[i];if(part!==void 0){const v=part.value;if(isPrimitive(v)||!isIterable(v)){text+="string"===typeof v?v:v+""}else{for(const t of v){text+="string"===typeof t?t:t+""}}}}text+=strings[l];return text}commit(){if(this.dirty){this.dirty=!1;this.element.setAttribute(this.name,this._getValue())}}}/**
   * A Part that controls all or part of an attribute value.
   */class AttributePart{constructor(committer){this.value=void 0;this.committer=committer}setValue(value){if(value!==noChange&&(!isPrimitive(value)||value!==this.value)){this.value=value;// If the value is a not a directive, dirty the committer so that it'll
// call setAttribute. If the value is a directive, it'll dirty the
// committer if it calls setValue().
if(!isDirective(value)){this.committer.dirty=!0}}}commit(){while(isDirective(this.value)){const directive=this.value;this.value=noChange;directive(this)}if(this.value===noChange){return}this.committer.commit()}}/**
   * A Part that controls a location within a Node tree. Like a Range, NodePart
   * has start and end locations and can set and update the Nodes between those
   * locations.
   *
   * NodeParts support several value types: primitives, Nodes, TemplateResults,
   * as well as arrays and iterables of those types.
   */class NodePart{constructor(options){this.value=void 0;this.__pendingValue=void 0;this.options=options}/**
     * Appends this part into a container.
     *
     * This part must be empty, as its contents are not automatically moved.
     */appendInto(container){this.startNode=container.appendChild(createMarker());this.endNode=container.appendChild(createMarker())}/**
     * Inserts this part after the `ref` node (between `ref` and `ref`'s next
     * sibling). Both `ref` and its next sibling must be static, unchanging nodes
     * such as those that appear in a literal section of a template.
     *
     * This part must be empty, as its contents are not automatically moved.
     */insertAfterNode(ref){this.startNode=ref;this.endNode=ref.nextSibling}/**
     * Appends this part into a parent part.
     *
     * This part must be empty, as its contents are not automatically moved.
     */appendIntoPart(part){part.__insert(this.startNode=createMarker());part.__insert(this.endNode=createMarker())}/**
     * Inserts this part after the `ref` part.
     *
     * This part must be empty, as its contents are not automatically moved.
     */insertAfterPart(ref){ref.__insert(this.startNode=createMarker());this.endNode=ref.endNode;ref.endNode=this.startNode}setValue(value){this.__pendingValue=value}commit(){while(isDirective(this.__pendingValue)){const directive=this.__pendingValue;this.__pendingValue=noChange;directive(this)}const value=this.__pendingValue;if(value===noChange){return}if(isPrimitive(value)){if(value!==this.value){this.__commitText(value)}}else if(value instanceof TemplateResult){this.__commitTemplateResult(value)}else if(value instanceof Node){this.__commitNode(value)}else if(isIterable(value)){this.__commitIterable(value)}else if(value===nothing){this.value=nothing;this.clear()}else{// Fallback, will render the string representation
this.__commitText(value)}}__insert(node){this.endNode.parentNode.insertBefore(node,this.endNode)}__commitNode(value){if(this.value===value){return}this.clear();this.__insert(value);this.value=value}__commitText(value){const node=this.startNode.nextSibling;value=null==value?"":value;if(node===this.endNode.previousSibling&&3===node.nodeType/* Node.TEXT_NODE */){// If we only have a single text node between the markers, we can just
// set its value, rather than replacing it.
// TODO(justinfagnani): Can we just check if this.value is primitive?
node.data=value}else{this.__commitNode(document.createTextNode("string"===typeof value?value:value+""))}this.value=value}__commitTemplateResult(value){const template=this.options.templateFactory(value);if(this.value instanceof TemplateInstance&&this.value.template===template){this.value.update(value.values)}else{// Make sure we propagate the template processor from the TemplateResult
// so that we use its syntax extension, etc. The template factory comes
// from the render function options so that it can control template
// caching and preprocessing.
const instance=new TemplateInstance(template,value.processor,this.options),fragment=instance._clone();instance.update(value.values);this.__commitNode(fragment);this.value=instance}}__commitIterable(value){// For an Iterable, we create a new InstancePart per item, then set its
// value to the item. This is a little bit of overhead for every item in
// an Iterable, but it lets us recurse easily and efficiently update Arrays
// of TemplateResults that will be commonly returned from expressions like:
// array.map((i) => html`${i}`), by reusing existing TemplateInstances.
// If _value is an array, then the previous render was of an
// iterable and _value will contain the NodeParts from the previous
// render. If _value is not an array, clear this part and make a new
// array for NodeParts.
if(!Array.isArray(this.value)){this.value=[];this.clear()}// Lets us keep track of how many items we stamped so we can clear leftover
// items from a previous render
const itemParts=this.value;let partIndex=0,itemPart;for(const item of value){// Try to reuse an existing part
itemPart=itemParts[partIndex];// If no existing part, create a new one
if(itemPart===void 0){itemPart=new NodePart(this.options);itemParts.push(itemPart);if(0===partIndex){itemPart.appendIntoPart(this)}else{itemPart.insertAfterPart(itemParts[partIndex-1])}}itemPart.setValue(item);itemPart.commit();partIndex++}if(partIndex<itemParts.length){// Truncate the parts array so _value reflects the current state
itemParts.length=partIndex;this.clear(itemPart&&itemPart.endNode)}}clear(startNode=this.startNode){removeNodes(this.startNode.parentNode,startNode.nextSibling,this.endNode)}}/**
   * Implements a boolean attribute, roughly as defined in the HTML
   * specification.
   *
   * If the value is truthy, then the attribute is present with a value of
   * ''. If the value is falsey, the attribute is removed.
   */class BooleanAttributePart{constructor(element,name,strings){this.value=void 0;this.__pendingValue=void 0;if(2!==strings.length||""!==strings[0]||""!==strings[1]){throw new Error("Boolean attributes can only contain a single expression")}this.element=element;this.name=name;this.strings=strings}setValue(value){this.__pendingValue=value}commit(){while(isDirective(this.__pendingValue)){const directive=this.__pendingValue;this.__pendingValue=noChange;directive(this)}if(this.__pendingValue===noChange){return}const value=!!this.__pendingValue;if(this.value!==value){if(value){this.element.setAttribute(this.name,"")}else{this.element.removeAttribute(this.name)}this.value=value}this.__pendingValue=noChange}}/**
   * Sets attribute values for PropertyParts, so that the value is only set once
   * even if there are multiple parts for a property.
   *
   * If an expression controls the whole property value, then the value is simply
   * assigned to the property under control. If there are string literals or
   * multiple expressions, then the strings are expressions are interpolated into
   * a string first.
   */class PropertyCommitter extends AttributeCommitter{constructor(element,name,strings){super(element,name,strings);this.single=2===strings.length&&""===strings[0]&&""===strings[1]}_createPart(){return new PropertyPart(this)}_getValue(){if(this.single){return this.parts[0].value}return super._getValue()}commit(){if(this.dirty){this.dirty=!1;// tslint:disable-next-line:no-any
this.element[this.name]=this._getValue()}}}class PropertyPart extends AttributePart{}// Detect event listener options support. If the `capture` property is read
// from the options object, then options are supported. If not, then the thrid
// argument to add/removeEventListener is interpreted as the boolean capture
// value so we should only pass the `capture` property.
let eventOptionsSupported=!1;try{const options={get capture(){eventOptionsSupported=!0;return!1}};// tslint:disable-next-line:no-any
window.addEventListener("test",options,options);// tslint:disable-next-line:no-any
window.removeEventListener("test",options,options)}catch(_e){}class EventPart{constructor(element,eventName,eventContext){this.value=void 0;this.__pendingValue=void 0;this.element=element;this.eventName=eventName;this.eventContext=eventContext;this.__boundHandleEvent=e=>this.handleEvent(e)}setValue(value){this.__pendingValue=value}commit(){while(isDirective(this.__pendingValue)){const directive=this.__pendingValue;this.__pendingValue=noChange;directive(this)}if(this.__pendingValue===noChange){return}const newListener=this.__pendingValue,oldListener=this.value,shouldRemoveListener=null==newListener||null!=oldListener&&(newListener.capture!==oldListener.capture||newListener.once!==oldListener.once||newListener.passive!==oldListener.passive),shouldAddListener=null!=newListener&&(null==oldListener||shouldRemoveListener);if(shouldRemoveListener){this.element.removeEventListener(this.eventName,this.__boundHandleEvent,this.__options)}if(shouldAddListener){this.__options=getOptions(newListener);this.element.addEventListener(this.eventName,this.__boundHandleEvent,this.__options)}this.value=newListener;this.__pendingValue=noChange}handleEvent(event){if("function"===typeof this.value){this.value.call(this.eventContext||this.element,event)}else{this.value.handleEvent(event)}}}// We copy options because of the inconsistent behavior of browsers when reading
// the third argument of add/removeEventListener. IE11 doesn't support options
// at all. Chrome 41 only reads `capture` if the argument is an object.
const getOptions=o=>o&&(eventOptionsSupported?{capture:o.capture,passive:o.passive,once:o.once}:o.capture);var parts={isPrimitive:isPrimitive,isIterable:isIterable,AttributeCommitter:AttributeCommitter,AttributePart:AttributePart,NodePart:NodePart,BooleanAttributePart:BooleanAttributePart,PropertyCommitter:PropertyCommitter,PropertyPart:PropertyPart,EventPart:EventPart};class DefaultTemplateProcessor{/**
   * Create parts for an attribute-position binding, given the event, attribute
   * name, and string literals.
   *
   * @param element The element containing the binding
   * @param name  The attribute name
   * @param strings The string literals. There are always at least two strings,
   *   event for fully-controlled bindings with a single expression.
   */handleAttributeExpressions(element,name,strings,options){const prefix=name[0];if("."===prefix){const committer=new PropertyCommitter(element,name.slice(1),strings);return committer.parts}if("@"===prefix){return[new EventPart(element,name.slice(1),options.eventContext)]}if("?"===prefix){return[new BooleanAttributePart(element,name.slice(1),strings)]}const committer=new AttributeCommitter(element,name,strings);return committer.parts}/**
     * Create parts for a text-position binding.
     * @param templateFactory
     */handleTextExpression(options){return new NodePart(options)}}const defaultTemplateProcessor=new DefaultTemplateProcessor;var defaultTemplateProcessor$1={DefaultTemplateProcessor:DefaultTemplateProcessor,defaultTemplateProcessor:defaultTemplateProcessor};function templateFactory(result){let templateCache=templateCaches.get(result.type);if(templateCache===void 0){templateCache={stringsArray:new WeakMap,keyString:new Map};templateCaches.set(result.type,templateCache)}let template=templateCache.stringsArray.get(result.strings);if(template!==void 0){return template}// If the TemplateStringsArray is new, generate a key from the strings
// This key is shared between all templates with identical content
const key=result.strings.join(marker);// Check if we already have a Template for this key
template=templateCache.keyString.get(key);if(template===void 0){// If we have not seen this key before, create a new Template
template=new Template(result,result.getTemplateElement());// Cache the Template for this key
templateCache.keyString.set(key,template)}// Cache all future queries for this TemplateStringsArray
templateCache.stringsArray.set(result.strings,template);return template}const templateCaches=new Map;var templateFactory$1={templateFactory:templateFactory,templateCaches:templateCaches};const parts$1=new WeakMap,render=(result,container,options)=>{let part=parts$1.get(container);if(part===void 0){removeNodes(container,container.firstChild);parts$1.set(container,part=new NodePart(Object.assign({templateFactory},options)));part.appendInto(container)}part.setValue(result);part.commit()};/**
                                     * Renders a template to a container.
                                     *
                                     * To update a container with new values, reevaluate the template literal and
                                     * call `render` with the new result.
                                     *
                                     * @param result a TemplateResult created by evaluating a template tag like
                                     *     `html` or `svg`.
                                     * @param container A DOM parent to render to. The entire contents are either
                                     *     replaced, or efficiently updated if the same result type was previous
                                     *     rendered there.
                                     * @param options RenderOptions for the entire render tree rendered to this
                                     *     container. Render options must *not* change between renders to the same
                                     *     container, as those changes will not effect previously rendered DOM.
                                     */var render$1={parts:parts$1,render:render};// This line will be used in regexes to search for lit-html usage.
// TODO(justinfagnani): inject version number at build time
(window.litHtmlVersions||(window.litHtmlVersions=[])).push("1.0.0");/**
                                                                                * Interprets a template literal as an HTML template that can efficiently
                                                                                * render to and update a container.
                                                                                */const html=(strings,...values)=>new TemplateResult(strings,values,"html",defaultTemplateProcessor),svg=(strings,...values)=>new SVGTemplateResult(strings,values,"svg",defaultTemplateProcessor);/**
                                                                                                                    * Interprets a template literal as an SVG template that can efficiently
                                                                                                                    * render to and update a container.
                                                                                                                    */var litHtml={html:html,svg:svg,DefaultTemplateProcessor:DefaultTemplateProcessor,defaultTemplateProcessor:defaultTemplateProcessor,directive:directive,isDirective:isDirective,removeNodes:removeNodes,reparentNodes:reparentNodes,noChange:noChange,nothing:nothing,AttributeCommitter:AttributeCommitter,AttributePart:AttributePart,BooleanAttributePart:BooleanAttributePart,EventPart:EventPart,isIterable:isIterable,isPrimitive:isPrimitive,NodePart:NodePart,PropertyCommitter:PropertyCommitter,PropertyPart:PropertyPart,parts:parts$1,render:render,templateCaches:templateCaches,templateFactory:templateFactory,TemplateInstance:TemplateInstance,SVGTemplateResult:SVGTemplateResult,TemplateResult:TemplateResult,createMarker:createMarker,isTemplatePartActive:isTemplatePartActive,Template:Template};const walkerNodeFilter=133/* NodeFilter.SHOW_{ELEMENT|COMMENT|TEXT} */;/**
                                                                            * Removes the list of nodes from a Template safely. In addition to removing
                                                                            * nodes from the Template, the Template part indices are updated to match
                                                                            * the mutated Template DOM.
                                                                            *
                                                                            * As the template is walked the removal state is tracked and
                                                                            * part indices are adjusted as needed.
                                                                            *
                                                                            * div
                                                                            *   div#1 (remove) <-- start removing (removing node is div#1)
                                                                            *     div
                                                                            *       div#2 (remove)  <-- continue removing (removing node is still div#1)
                                                                            *         div
                                                                            * div <-- stop removing since previous sibling is the removing node (div#1,
                                                                            * removed 4 nodes)
                                                                            */function removeNodesFromTemplate(template,nodesToRemove){const{element:{content},parts}=template,walker=document.createTreeWalker(content,walkerNodeFilter,null,!1);let partIndex=nextActiveIndexInTemplateParts(parts),part=parts[partIndex],nodeIndex=-1,removeCount=0;const nodesToRemoveInTemplate=[];let currentRemovingNode=null;while(walker.nextNode()){nodeIndex++;const node=walker.currentNode;// End removal if stepped past the removing node
if(node.previousSibling===currentRemovingNode){currentRemovingNode=null}// A node to remove was found in the template
if(nodesToRemove.has(node)){nodesToRemoveInTemplate.push(node);// Track node we're removing
if(null===currentRemovingNode){currentRemovingNode=node}}// When removing, increment count by which to adjust subsequent part indices
if(null!==currentRemovingNode){removeCount++}while(part!==void 0&&part.index===nodeIndex){// If part is in a removed node deactivate it by setting index to -1 or
// adjust the index as needed.
part.index=null!==currentRemovingNode?-1:part.index-removeCount;// go to the next active part.
partIndex=nextActiveIndexInTemplateParts(parts,partIndex);part=parts[partIndex]}}nodesToRemoveInTemplate.forEach(n=>n.parentNode.removeChild(n))}const countNodes=node=>{let count=11===node.nodeType/* Node.DOCUMENT_FRAGMENT_NODE */?0:1;const walker=document.createTreeWalker(node,walkerNodeFilter,null,!1);while(walker.nextNode()){count++}return count},nextActiveIndexInTemplateParts=(parts,startIndex=-1)=>{for(let i=startIndex+1;i<parts.length;i++){const part=parts[i];if(isTemplatePartActive(part)){return i}}return-1};/**
    * Inserts the given node into the Template, optionally before the given
    * refNode. In addition to inserting the node into the Template, the Template
    * part indices are updated to match the mutated Template DOM.
    */function insertNodeIntoTemplate(template,node,refNode=null){const{element:{content},parts}=template;// If there's no refNode, then put node at end of template.
// No part indices need to be shifted in this case.
if(null===refNode||refNode===void 0){content.appendChild(node);return}const walker=document.createTreeWalker(content,walkerNodeFilter,null,!1);let partIndex=nextActiveIndexInTemplateParts(parts),insertCount=0,walkerIndex=-1;while(walker.nextNode()){walkerIndex++;const walkerNode=walker.currentNode;if(walkerNode===refNode){insertCount=countNodes(node);refNode.parentNode.insertBefore(node,refNode)}while(-1!==partIndex&&parts[partIndex].index===walkerIndex){// If we've inserted the node, simply adjust all subsequent parts
if(0<insertCount){while(-1!==partIndex){parts[partIndex].index+=insertCount;partIndex=nextActiveIndexInTemplateParts(parts,partIndex)}return}partIndex=nextActiveIndexInTemplateParts(parts,partIndex)}}}var modifyTemplate={removeNodesFromTemplate:removeNodesFromTemplate,insertNodeIntoTemplate:insertNodeIntoTemplate};const getTemplateCacheKey=(type,scopeName)=>`${type}--${scopeName}`;let compatibleShadyCSSVersion=!0;if("undefined"===typeof window.ShadyCSS){compatibleShadyCSSVersion=!1}else if("undefined"===typeof window.ShadyCSS.prepareTemplateDom){console.warn(`Incompatible ShadyCSS version detected. `+`Please update to at least @webcomponents/webcomponentsjs@2.0.2 and `+`@webcomponents/shadycss@1.3.1.`);compatibleShadyCSSVersion=!1}/**
   * Template factory which scopes template DOM using ShadyCSS.
   * @param scopeName {string}
   */const shadyTemplateFactory=scopeName=>result=>{const cacheKey=getTemplateCacheKey(result.type,scopeName);let templateCache=templateCaches.get(cacheKey);if(templateCache===void 0){templateCache={stringsArray:new WeakMap,keyString:new Map};templateCaches.set(cacheKey,templateCache)}let template=templateCache.stringsArray.get(result.strings);if(template!==void 0){return template}const key=result.strings.join(marker);template=templateCache.keyString.get(key);if(template===void 0){const element=result.getTemplateElement();if(compatibleShadyCSSVersion){window.ShadyCSS.prepareTemplateDom(element,scopeName)}template=new Template(result,element);templateCache.keyString.set(key,template)}templateCache.stringsArray.set(result.strings,template);return template},TEMPLATE_TYPES=["html","svg"],removeStylesFromLitTemplates=scopeName=>{TEMPLATE_TYPES.forEach(type=>{const templates=templateCaches.get(getTemplateCacheKey(type,scopeName));if(templates!==void 0){templates.keyString.forEach(template=>{const{element:{content}}=template,styles=new Set;// IE 11 doesn't support the iterable param Set constructor
Array.from(content.querySelectorAll("style")).forEach(s=>{styles.add(s)});removeNodesFromTemplate(template,styles)})}})},shadyRenderSet=new Set,prepareTemplateStyles=(renderedDOM,template,scopeName)=>{shadyRenderSet.add(scopeName);// Move styles out of rendered DOM and store.
const styles=renderedDOM.querySelectorAll("style"),{length}=styles;// If there are no styles, skip unnecessary work
if(0===length){// Ensure prepareTemplateStyles is called to support adding
// styles via `prepareAdoptedCssText` since that requires that
// `prepareTemplateStyles` is called.
window.ShadyCSS.prepareTemplateStyles(template.element,scopeName);return}const condensedStyle=document.createElement("style");// Collect styles into a single style. This helps us make sure ShadyCSS
// manipulations will not prevent us from being able to fix up template
// part indices.
// NOTE: collecting styles is inefficient for browsers but ShadyCSS
// currently does this anyway. When it does not, this should be changed.
for(let i=0;i<length;i++){const style=styles[i];style.parentNode.removeChild(style);condensedStyle.textContent+=style.textContent}// Remove styles from nested templates in this scope.
removeStylesFromLitTemplates(scopeName);// And then put the condensed style into the "root" template passed in as
// `template`.
const content=template.element.content;insertNodeIntoTemplate(template,condensedStyle,content.firstChild);// Note, it's important that ShadyCSS gets the template that `lit-html`
// will actually render so that it can update the style inside when
// needed (e.g. @apply native Shadow DOM case).
window.ShadyCSS.prepareTemplateStyles(template.element,scopeName);const style=content.querySelector("style");if(window.ShadyCSS.nativeShadow&&null!==style){// When in native Shadow DOM, ensure the style created by ShadyCSS is
// included in initially rendered output (`renderedDOM`).
renderedDOM.insertBefore(style.cloneNode(!0),renderedDOM.firstChild)}else{// When no style is left in the template, parts will be broken as a
// result. To fix this, we put back the style node ShadyCSS removed
// and then tell lit to remove that node from the template.
// There can be no style in the template in 2 cases (1) when Shady DOM
// is in use, ShadyCSS removes all styles, (2) when native Shadow DOM
// is in use ShadyCSS removes the style if it contains no content.
// NOTE, ShadyCSS creates its own style so we can safely add/remove
// `condensedStyle` here.
content.insertBefore(condensedStyle,content.firstChild);const removes=new Set([condensedStyle]);removeNodesFromTemplate(template,removes)}},render$2=(result,container,options)=>{const scopeName=options.scopeName,hasRendered=parts$1.has(container),needsScoping=compatibleShadyCSSVersion&&11===container.nodeType/* Node.DOCUMENT_FRAGMENT_NODE */&&!!container.host&&result instanceof TemplateResult,firstScopeRender=needsScoping&&!shadyRenderSet.has(scopeName),renderContainer=firstScopeRender?document.createDocumentFragment():container;render(result,renderContainer,Object.assign({templateFactory:shadyTemplateFactory(scopeName)},options));// When performing first scope render,
// (1) We've rendered into a fragment so that there's a chance to
// `prepareTemplateStyles` before sub-elements hit the DOM
// (which might cause them to render based on a common pattern of
// rendering in a custom element's `connectedCallback`);
// (2) Scope the template with ShadyCSS one time only for this scope.
// (3) Render the fragment into the container and make sure the
// container knows its `part` is the one we just rendered. This ensures
// DOM will be re-used on subsequent renders.
if(firstScopeRender){const part=parts$1.get(renderContainer);parts$1.delete(renderContainer);if(part.value instanceof TemplateInstance){prepareTemplateStyles(renderContainer,part.value.template,scopeName)}removeNodes(container,container.firstChild);container.appendChild(renderContainer);parts$1.set(container,part)}// After elements have hit the DOM, update styling if this is the
// initial render to this container.
// This is needed whenever dynamic changes are made so it would be
// safest to do every render; however, this would regress performance
// so we leave it up to the user to call `ShadyCSSS.styleElement`
// for dynamic changes.
if(!hasRendered&&needsScoping){window.ShadyCSS.styleElement(container.host)}};var shadyRender={render:render$2,html:html,svg:svg,TemplateResult:TemplateResult};// IMPORTANT: do not change the property name or the assignment expression.
// This line will be used in regexes to search for LitElement usage.
// TODO(justinfagnani): inject version number at build time
(window.litElementVersions||(window.litElementVersions=[])).push("2.2.0");/**
                                                                                      * Minimal implementation of Array.prototype.flat
                                                                                      * @param arr the array to flatten
                                                                                      * @param result the accumlated result
                                                                                      */function arrayFlat(styles,result=[]){for(let i=0,length=styles.length;i<length;i++){const value=styles[i];if(Array.isArray(value)){arrayFlat(value,result)}else{result.push(value)}}return result}/** Deeply flattens styles array. Uses native flat if available. */const flattenStyles=styles=>styles.flat?styles.flat(1/0):arrayFlat(styles);class LitElement extends UpdatingElement{/** @nocollapse */static finalize(){super.finalize();// Prepare styling that is stamped at first render time. Styling
// is built from user provided `styles` or is inherited from the superclass.
this._styles=this.hasOwnProperty(JSCompiler_renameProperty("styles",this))?this._getUniqueStyles():this._styles||[]}/** @nocollapse */static _getUniqueStyles(){// Take care not to call `this.styles` multiple times since this generates
// new CSSResults each time.
// TODO(sorvell): Since we do not cache CSSResults by input, any
// shared styles will generate new stylesheet objects, which is wasteful.
// This should be addressed when a browser ships constructable
// stylesheets.
const userStyles=this.styles,styles=[];if(Array.isArray(userStyles)){const flatStyles=flattenStyles(userStyles),styleSet=flatStyles.reduceRight((set,s)=>{set.add(s);// on IE set.add does not return the set.
return set},new Set);// As a performance optimization to avoid duplicated styling that can
// occur especially when composing via subclassing, de-duplicate styles
// preserving the last item in the list. The last item is kept to
// try to preserve cascade order with the assumption that it's most
// important that last added styles override previous styles.
// Array.from does not work on Set in IE
styleSet.forEach(v=>styles.unshift(v))}else if(userStyles){styles.push(userStyles)}return styles}/**
     * Performs element initialization. By default this calls `createRenderRoot`
     * to create the element `renderRoot` node and captures any pre-set values for
     * registered properties.
     */initialize(){super.initialize();this.renderRoot=this.createRenderRoot();// Note, if renderRoot is not a shadowRoot, styles would/could apply to the
// element's getRootNode(). While this could be done, we're choosing not to
// support this now since it would require different logic around de-duping.
if(window.ShadowRoot&&this.renderRoot instanceof window.ShadowRoot){this.adoptStyles()}}/**
     * Returns the node into which the element should render and by default
     * creates and returns an open shadowRoot. Implement to customize where the
     * element's DOM is rendered. For example, to render into the element's
     * childNodes, return `this`.
     * @returns {Element|DocumentFragment} Returns a node into which to render.
     */createRenderRoot(){return this.attachShadow({mode:"open"})}/**
     * Applies styling to the element shadowRoot using the `static get styles`
     * property. Styling will apply using `shadowRoot.adoptedStyleSheets` where
     * available and will fallback otherwise. When Shadow DOM is polyfilled,
     * ShadyCSS scopes styles and adds them to the document. When Shadow DOM
     * is available but `adoptedStyleSheets` is not, styles are appended to the
     * end of the `shadowRoot` to [mimic spec
     * behavior](https://wicg.github.io/construct-stylesheets/#using-constructed-stylesheets).
     */adoptStyles(){const styles=this.constructor._styles;if(0===styles.length){return}// There are three separate cases here based on Shadow DOM support.
// (1) shadowRoot polyfilled: use ShadyCSS
// (2) shadowRoot.adoptedStyleSheets available: use it.
// (3) shadowRoot.adoptedStyleSheets polyfilled: append styles after
// rendering
if(window.ShadyCSS!==void 0&&!window.ShadyCSS.nativeShadow){window.ShadyCSS.ScopingShim.prepareAdoptedCssText(styles.map(s=>s.cssText),this.localName)}else if(supportsAdoptingStyleSheets){this.renderRoot.adoptedStyleSheets=styles.map(s=>s.styleSheet)}else{// This must be done after rendering so the actual style insertion is done
// in `update`.
this._needsShimAdoptedStyleSheets=!0}}connectedCallback(){super.connectedCallback();// Note, first update/render handles styleElement so we only call this if
// connected after first update.
if(this.hasUpdated&&window.ShadyCSS!==void 0){window.ShadyCSS.styleElement(this)}}/**
     * Updates the element. This method reflects property values to attributes
     * and calls `render` to render DOM via lit-html. Setting properties inside
     * this method will *not* trigger another update.
     * * @param _changedProperties Map of changed properties with old values
     */update(changedProperties){super.update(changedProperties);const templateResult=this.render();if(templateResult instanceof TemplateResult){this.constructor.render(templateResult,this.renderRoot,{scopeName:this.localName,eventContext:this})}// When native Shadow DOM is used but adoptedStyles are not supported,
// insert styling after rendering to ensure adoptedStyles have highest
// priority.
if(this._needsShimAdoptedStyleSheets){this._needsShimAdoptedStyleSheets=!1;this.constructor._styles.forEach(s=>{const style=document.createElement("style");style.textContent=s.cssText;this.renderRoot.appendChild(style)})}}/**
     * Invoked on each update to perform rendering tasks. This method must return
     * a lit-html TemplateResult. Setting properties inside this method will *not*
     * trigger the element to update.
     */render(){}}/**
   * Ensure this class is marked as `finalized` as an optimization ensuring
   * it will not needlessly try to `finalize`.
   */LitElement.finalized=!0;/**
                              * Render method used to render the lit-html TemplateResult to the element's
                              * DOM.
                              * @param {TemplateResult} Template to render.
                              * @param {Element|DocumentFragment} Node into which to render.
                              * @param {String} Element name.
                              * @nocollapse
                              */LitElement.render=render$2;var litElement={LitElement:LitElement,defaultConverter:defaultConverter,notEqual:notEqual,UpdatingElement:UpdatingElement,customElement:customElement,property:property,query:query,queryAll:queryAll,eventOptions:eventOptions,html:html,svg:svg,TemplateResult:TemplateResult,SVGTemplateResult:SVGTemplateResult,supportsAdoptingStyleSheets:supportsAdoptingStyleSheets,CSSResult:CSSResult,unsafeCSS:unsafeCSS,css:css};// unsafeHTML directive, and the DocumentFragment that was last set as a value.
// The DocumentFragment is used as a unique key to check if the last value
// rendered to the part was with unsafeHTML. If not, we'll always re-render the
// value passed to unsafeHTML.
const previousValues=new WeakMap,unsafeHTML=directive(value=>part=>{if(!(part instanceof NodePart)){throw new Error("unsafeHTML can only be used in text bindings")}const previousValue=previousValues.get(part);if(previousValue!==void 0&&isPrimitive(value)&&value===previousValue.value&&part.value===previousValue.fragment){return}const template=document.createElement("template");template.innerHTML=value;// innerHTML casts to string internally
const fragment=document.importNode(template.content,!0);part.setValue(fragment);previousValues.set(part,{value,fragment})});/**
                                       * Renders the result as HTML, rather than text.
                                       *
                                       * Note, this is unsafe to use with any user-provided input that hasn't been
                                       * sanitized or escaped, as it may lead to cross-site-scripting
                                       * vulnerabilities.
                                       */var unsafeHtml={unsafeHTML:unsafeHTML};const _state=new WeakMap,_infinity=2147483647,until=directive((...args)=>part=>{let state=_state.get(part);if(state===void 0){state={lastRenderedIndex:_infinity,values:[]};_state.set(part,state)}const previousValues=state.values;let previousLength=previousValues.length;state.values=args;for(let i=0;i<args.length;i++){// If we've rendered a higher-priority value already, stop.
if(i>state.lastRenderedIndex){break}const value=args[i];// Render non-Promise values immediately
if(isPrimitive(value)||"function"!==typeof value.then){part.setValue(value);state.lastRenderedIndex=i;// Since a lower-priority value will never overwrite a higher-priority
// synchronous value, we can stop processsing now.
break}// If this is a Promise we've already handled, skip it.
if(i<previousLength&&value===previousValues[i]){continue}// We have a Promise that we haven't seen before, so priorities may have
// changed. Forget what we rendered before.
state.lastRenderedIndex=_infinity;previousLength=0;Promise.resolve(value).then(resolvedValue=>{const index=state.values.indexOf(value);// If state.values doesn't contain the value, we've re-rendered without
// the value, so don't render it. Then, only render if the value is
// higher-priority than what's already been rendered.
if(-1<index&&index<state.lastRenderedIndex){state.lastRenderedIndex=index;part.setValue(resolvedValue);part.commit()}})}});// Effectively infinity, but a SMI.
var until$1={until:until};/**
   @license
   Copyright (c) 2019 The Polymer Project Authors. All rights reserved.
   This code may only be used under the BSD style license found at
   http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
   http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
   found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
   part of the polymer project is also subject to an additional IP rights grant
   found at http://polymer.github.io/PATENTS.txt
   */const supportsAdoptingStyleSheets$1="adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,constructionToken$1=Symbol();class CSSResult$1{constructor(cssText,safeToken){if(safeToken!==constructionToken$1){throw new Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.")}this.cssText=cssText}// Note, this is a getter so that it's lazy. In practice, this means
// stylesheets are not created until the first element instance is made.
get styleSheet(){if(void 0===this._styleSheet){// Note, if `adoptedStyleSheets` is supported then we assume CSSStyleSheet
// is constructable.
if(supportsAdoptingStyleSheets$1){this._styleSheet=new CSSStyleSheet;this._styleSheet.replaceSync(this.cssText)}else{this._styleSheet=null}}return this._styleSheet}toString(){return this.cssText}}/**
  * Wrap a value for interpolation in a css tagged template literal.
  *
  * This is unsafe because untrusted CSS text can be used to phone home
  * or exfiltrate data to an attacker controlled site. Take care to only use
  * this with trusted input.
  */const unsafeCSS$1=value=>{return new CSSResult$1(value+"",constructionToken$1)},textFromCSSResult$1=value=>{if(value instanceof CSSResult$1){return value.cssText}else if("number"===typeof value){return value}else{throw new Error(`Value passed to 'css' function must be a 'css' function result: ${value}. Use 'unsafeCSS' to pass non-literal values, but
            take care to ensure page security.`)}},css$1=(strings,...values)=>{const cssText=values.reduce((acc,v,idx)=>acc+textFromCSSResult$1(v)+strings[idx+1],strings[0]);return new CSSResult$1(cssText,constructionToken$1)};var cssTag$1={supportsAdoptingStyleSheets:supportsAdoptingStyleSheets$1,CSSResult:CSSResult$1,unsafeCSS:unsafeCSS$1,css:css$1};/**
   * @license
   * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
   * This code may only be used under the BSD style license found at
   * http://polymer.github.io/LICENSE.txt
   * The complete set of authors may be found at
   * http://polymer.github.io/AUTHORS.txt
   * The complete set of contributors may be found at
   * http://polymer.github.io/CONTRIBUTORS.txt
   * Code distributed by Google as part of the polymer project is also
   * subject to an additional IP rights grant found at
   * http://polymer.github.io/PATENTS.txt
   */const legacyCustomElement$1=(tagName,clazz)=>{window.customElements.define(tagName,clazz);// Cast as any because TS doesn't recognize the return type as being a
// subtype of the decorated class when clazz is typed as
// `Constructor<HTMLElement>` for some reason.
// `Constructor<HTMLElement>` is helpful to make sure the decorator is
// applied to elements however.
// tslint:disable-next-line:no-any
return clazz},standardCustomElement$1=(tagName,descriptor)=>{const{kind,elements}=descriptor;return{kind,elements,// This callback is called once the class is otherwise fully defined
finisher(clazz){window.customElements.define(tagName,clazz)}}},customElement$1=tagName=>classOrDescriptor=>"function"===typeof classOrDescriptor?legacyCustomElement$1(tagName,classOrDescriptor):standardCustomElement$1(tagName,classOrDescriptor),standardProperty$1=(options,element)=>{// When decorating an accessor, pass it through and add property metadata.
// Note, the `hasOwnProperty` check in `createProperty` ensures we don't
// stomp over the user's accessor.
if("method"===element.kind&&element.descriptor&&!("value"in element.descriptor)){return Object.assign({},element,{finisher(clazz){clazz.createProperty(element.key,options)}})}else{// createProperty() takes care of defining the property, but we still
// must return some kind of descriptor, so return a descriptor for an
// unused prototype field. The finisher calls createProperty().
return{kind:"field",key:Symbol(),placement:"own",descriptor:{},// When @babel/plugin-proposal-decorators implements initializers,
// do this instead of the initializer below. See:
// https://github.com/babel/babel/issues/9260 extras: [
//   {
//     kind: 'initializer',
//     placement: 'own',
//     initializer: descriptor.initializer,
//   }
// ],
initializer(){if("function"===typeof element.initializer){this[element.key]=element.initializer.call(this)}},finisher(clazz){clazz.createProperty(element.key,options)}}}},legacyProperty$1=(options,proto,name)=>{proto.constructor.createProperty(name,options)};/**
   * A property decorator which creates a LitElement property which reflects a
   * corresponding attribute value. A `PropertyDeclaration` may optionally be
   * supplied to configure property features.
   *
   * @ExportDecoratedItems
   */function property$1(options){// tslint:disable-next-line:no-any decorator
return(protoOrDescriptor,name)=>void 0!==name?legacyProperty$1(options,protoOrDescriptor,name):standardProperty$1(options,protoOrDescriptor)}/**
  * A property decorator that converts a class property into a getter that
  * executes a querySelector on the element's renderRoot.
  *
  * @ExportDecoratedItems
  */function query$1(selector){return(protoOrDescriptor,// tslint:disable-next-line:no-any decorator
name)=>{const descriptor={get(){return this.renderRoot.querySelector(selector)},enumerable:!0,configurable:!0};return void 0!==name?legacyQuery$1(descriptor,protoOrDescriptor,name):standardQuery$1(descriptor,protoOrDescriptor)}}/**
  * A property decorator that converts a class property into a getter
  * that executes a querySelectorAll on the element's renderRoot.
  *
  * @ExportDecoratedItems
  */function queryAll$1(selector){return(protoOrDescriptor,// tslint:disable-next-line:no-any decorator
name)=>{const descriptor={get(){return this.renderRoot.querySelectorAll(selector)},enumerable:!0,configurable:!0};return void 0!==name?legacyQuery$1(descriptor,protoOrDescriptor,name):standardQuery$1(descriptor,protoOrDescriptor)}}const legacyQuery$1=(descriptor,proto,name)=>{Object.defineProperty(proto,name,descriptor)},standardQuery$1=(descriptor,element)=>({kind:"method",placement:"prototype",key:element.key,descriptor}),standardEventOptions$1=(options,element)=>{return Object.assign({},element,{finisher(clazz){Object.assign(clazz.prototype[element.key],options)}})},legacyEventOptions$1=// tslint:disable-next-line:no-any legacy decorator
(options,proto,name)=>{Object.assign(proto[name],options)},eventOptions$1=options=>// Return value typed as any to prevent TypeScript from complaining that
// standard decorator function signature does not match TypeScript decorator
// signature
// TODO(kschaaf): unclear why it was only failing on this decorator and not
// the others
(protoOrDescriptor,name)=>void 0!==name?legacyEventOptions$1(options,protoOrDescriptor,name):standardEventOptions$1(options,protoOrDescriptor);var decorators$1={customElement:customElement$1,property:property$1,query:query$1,queryAll:queryAll$1,eventOptions:eventOptions$1};/**
   * @license
   * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
   * This code may only be used under the BSD style license found at
   * http://polymer.github.io/LICENSE.txt
   * The complete set of authors may be found at
   * http://polymer.github.io/AUTHORS.txt
   * The complete set of contributors may be found at
   * http://polymer.github.io/CONTRIBUTORS.txt
   * Code distributed by Google as part of the polymer project is also
   * subject to an additional IP rights grant found at
   * http://polymer.github.io/PATENTS.txt
   */ /**
       * When using Closure Compiler, JSCompiler_renameProperty(property, object) is
       * replaced at compile time by the munged name for object[property]. We cannot
       * alias this function, so we have to use a small shim that has the same
       * behavior when not compiling.
       */window.JSCompiler_renameProperty=(prop,_obj)=>prop;const defaultConverter$1={toAttribute(value,type){switch(type){case Boolean:return value?"":null;case Object:case Array:// if the value is `null` or `undefined` pass this through
// to allow removing/no change behavior.
return null==value?value:JSON.stringify(value);}return value},fromAttribute(value,type){switch(type){case Boolean:return null!==value;case Number:return null===value?null:+value;case Object:case Array:return JSON.parse(value);}return value}},notEqual$1=(value,old)=>{// This ensures (old==NaN, value==NaN) always returns false
return old!==value&&(old===old||value===value)},defaultPropertyDeclaration$1={attribute:!0,type:String,converter:defaultConverter$1,reflect:!1,hasChanged:notEqual$1},microtaskPromise$1=Promise.resolve(!0),STATE_HAS_UPDATED$1=1,STATE_UPDATE_REQUESTED$1=1<<2,STATE_IS_REFLECTING_TO_ATTRIBUTE$1=1<<3,STATE_IS_REFLECTING_TO_PROPERTY$1=1<<4,STATE_HAS_CONNECTED$1=1<<5;/**
                                      * Change function that returns true if `value` is different from `oldValue`.
                                      * This method is used as the default for a property's `hasChanged` function.
                                      */ /**
                                                                       * Base element class which manages element properties and attributes. When
                                                                       * properties change, the `update` method is asynchronously called. This method
                                                                       * should be supplied by subclassers to render updates as desired.
                                                                       */class UpdatingElement$1 extends HTMLElement{constructor(){super();this._updateState=0;this._instanceProperties=void 0;this._updatePromise=microtaskPromise$1;this._hasConnectedResolver=void 0;/**
                                         * Map with keys for any properties that have changed since the last
                                         * update cycle with previous values.
                                         */this._changedProperties=new Map;/**
                                         * Map with keys of properties that should be reflected when updated.
                                         */this._reflectingProperties=void 0;this.initialize()}/**
    * Returns a list of attributes corresponding to the registered properties.
    * @nocollapse
    */static get observedAttributes(){// note: piggy backing on this to ensure we're finalized.
this.finalize();const attributes=[];// Use forEach so this works even if for/of loops are compiled to for loops
// expecting arrays
this._classProperties.forEach((v,p)=>{const attr=this._attributeNameForProperty(p,v);if(void 0!==attr){this._attributeToPropertyMap.set(attr,p);attributes.push(attr)}});return attributes}/**
    * Ensures the private `_classProperties` property metadata is created.
    * In addition to `finalize` this is also called in `createProperty` to
    * ensure the `@property` decorator can add property metadata.
    */ /** @nocollapse */static _ensureClassProperties(){// ensure private storage for property declarations.
if(!this.hasOwnProperty(JSCompiler_renameProperty("_classProperties",this))){this._classProperties=new Map;// NOTE: Workaround IE11 not supporting Map constructor argument.
const superProperties=Object.getPrototypeOf(this)._classProperties;if(void 0!==superProperties){superProperties.forEach((v,k)=>this._classProperties.set(k,v))}}}/**
    * Creates a property accessor on the element prototype if one does not exist.
    * The property setter calls the property's `hasChanged` property option
    * or uses a strict identity check to determine whether or not to request
    * an update.
    * @nocollapse
    */static createProperty(name,options=defaultPropertyDeclaration$1){// Note, since this can be called by the `@property` decorator which
// is called before `finalize`, we ensure storage exists for property
// metadata.
this._ensureClassProperties();this._classProperties.set(name,options);// Do not generate an accessor if the prototype already has one, since
// it would be lost otherwise and that would never be the user's intention;
// Instead, we expect users to call `requestUpdate` themselves from
// user-defined accessors. Note that if the super has an accessor we will
// still overwrite it
if(options.noAccessor||this.prototype.hasOwnProperty(name)){return}const key="symbol"===typeof name?Symbol():`__${name}`;Object.defineProperty(this.prototype,name,{// tslint:disable-next-line:no-any no symbol in index
get(){return this[key]},set(value){const oldValue=this[name];this[key]=value;this._requestUpdate(name,oldValue)},configurable:!0,enumerable:!0})}/**
    * Creates property accessors for registered properties and ensures
    * any superclasses are also finalized.
    * @nocollapse
    */static finalize(){if(this.hasOwnProperty(JSCompiler_renameProperty("finalized",this))&&this.finalized){return}// finalize any superclasses
const superCtor=Object.getPrototypeOf(this);if("function"===typeof superCtor.finalize){superCtor.finalize()}this.finalized=!0;this._ensureClassProperties();// initialize Map populated in observedAttributes
this._attributeToPropertyMap=new Map;// make any properties
// Note, only process "own" properties since this element will inherit
// any properties defined on the superClass, and finalization ensures
// the entire prototype chain is finalized.
if(this.hasOwnProperty(JSCompiler_renameProperty("properties",this))){const props=this.properties,propKeys=[...Object.getOwnPropertyNames(props),...("function"===typeof Object.getOwnPropertySymbols?Object.getOwnPropertySymbols(props):[])];// support symbols in properties (IE11 does not support this)
// This for/of is ok because propKeys is an array
for(const p of propKeys){// note, use of `any` is due to TypeSript lack of support for symbol in
// index types
// tslint:disable-next-line:no-any no symbol in index
this.createProperty(p,props[p])}}}/**
    * Returns the property name for the given attribute `name`.
    * @nocollapse
    */static _attributeNameForProperty(name,options){const attribute=options.attribute;return!1===attribute?void 0:"string"===typeof attribute?attribute:"string"===typeof name?name.toLowerCase():void 0}/**
    * Returns true if a property should request an update.
    * Called when a property value is set and uses the `hasChanged`
    * option for the property if present or a strict identity check.
    * @nocollapse
    */static _valueHasChanged(value,old,hasChanged=notEqual$1){return hasChanged(value,old)}/**
    * Returns the property value for the given attribute value.
    * Called via the `attributeChangedCallback` and uses the property's
    * `converter` or `converter.fromAttribute` property option.
    * @nocollapse
    */static _propertyValueFromAttribute(value,options){const type=options.type,converter=options.converter||defaultConverter$1,fromAttribute="function"===typeof converter?converter:converter.fromAttribute;return fromAttribute?fromAttribute(value,type):value}/**
    * Returns the attribute value for the given property value. If this
    * returns undefined, the property will *not* be reflected to an attribute.
    * If this returns null, the attribute will be removed, otherwise the
    * attribute will be set to the value.
    * This uses the property's `reflect` and `type.toAttribute` property options.
    * @nocollapse
    */static _propertyValueToAttribute(value,options){if(void 0===options.reflect){return}const type=options.type,converter=options.converter,toAttribute=converter&&converter.toAttribute||defaultConverter$1.toAttribute;return toAttribute(value,type)}/**
    * Performs element initialization. By default captures any pre-set values for
    * registered properties.
    */initialize(){this._saveInstanceProperties();// ensures first update will be caught by an early access of
// `updateComplete`
this._requestUpdate()}/**
    * Fixes any properties set on the instance before upgrade time.
    * Otherwise these would shadow the accessor and break these properties.
    * The properties are stored in a Map which is played back after the
    * constructor runs. Note, on very old versions of Safari (<=9) or Chrome
    * (<=41), properties created for native platform properties like (`id` or
    * `name`) may not have default values set in the element constructor. On
    * these browsers native properties appear on instances and therefore their
    * default value will overwrite any element default (e.g. if the element sets
    * this.id = 'id' in the constructor, the 'id' will become '' since this is
    * the native platform default).
    */_saveInstanceProperties(){// Use forEach so this works even if for/of loops are compiled to for loops
// expecting arrays
this.constructor._classProperties.forEach((_v,p)=>{if(this.hasOwnProperty(p)){const value=this[p];delete this[p];if(!this._instanceProperties){this._instanceProperties=new Map}this._instanceProperties.set(p,value)}})}/**
    * Applies previously saved instance properties.
    */_applyInstanceProperties(){// Use forEach so this works even if for/of loops are compiled to for loops
// expecting arrays
// tslint:disable-next-line:no-any
this._instanceProperties.forEach((v,p)=>this[p]=v);this._instanceProperties=void 0}connectedCallback(){this._updateState=this._updateState|STATE_HAS_CONNECTED$1;// Ensure first connection completes an update. Updates cannot complete
// before connection and if one is pending connection the
// `_hasConnectionResolver` will exist. If so, resolve it to complete the
// update, otherwise requestUpdate.
if(this._hasConnectedResolver){this._hasConnectedResolver();this._hasConnectedResolver=void 0}}/**
    * Allows for `super.disconnectedCallback()` in extensions while
    * reserving the possibility of making non-breaking feature additions
    * when disconnecting at some point in the future.
    */disconnectedCallback(){}/**
                            * Synchronizes property values when attributes change.
                            */attributeChangedCallback(name,old,value){if(old!==value){this._attributeToProperty(name,value)}}_propertyToAttribute(name,value,options=defaultPropertyDeclaration$1){const ctor=this.constructor,attr=ctor._attributeNameForProperty(name,options);if(void 0!==attr){const attrValue=ctor._propertyValueToAttribute(value,options);// an undefined value does not change the attribute.
if(void 0===attrValue){return}// Track if the property is being reflected to avoid
// setting the property again via `attributeChangedCallback`. Note:
// 1. this takes advantage of the fact that the callback is synchronous.
// 2. will behave incorrectly if multiple attributes are in the reaction
// stack at time of calling. However, since we process attributes
// in `update` this should not be possible (or an extreme corner case
// that we'd like to discover).
// mark state reflecting
this._updateState=this._updateState|STATE_IS_REFLECTING_TO_ATTRIBUTE$1;if(null==attrValue){this.removeAttribute(attr)}else{this.setAttribute(attr,attrValue)}// mark state not reflecting
this._updateState=this._updateState&~STATE_IS_REFLECTING_TO_ATTRIBUTE$1}}_attributeToProperty(name,value){// Use tracking info to avoid deserializing attribute value if it was
// just set from a property setter.
if(this._updateState&STATE_IS_REFLECTING_TO_ATTRIBUTE$1){return}const ctor=this.constructor,propName=ctor._attributeToPropertyMap.get(name);if(void 0!==propName){const options=ctor._classProperties.get(propName)||defaultPropertyDeclaration$1;// mark state reflecting
this._updateState=this._updateState|STATE_IS_REFLECTING_TO_PROPERTY$1;this[propName]=// tslint:disable-next-line:no-any
ctor._propertyValueFromAttribute(value,options);// mark state not reflecting
this._updateState=this._updateState&~STATE_IS_REFLECTING_TO_PROPERTY$1}}/**
    * This private version of `requestUpdate` does not access or return the
    * `updateComplete` promise. This promise can be overridden and is therefore
    * not free to access.
    */_requestUpdate(name,oldValue){let shouldRequestUpdate=!0;// If we have a property key, perform property update steps.
if(void 0!==name){const ctor=this.constructor,options=ctor._classProperties.get(name)||defaultPropertyDeclaration$1;if(ctor._valueHasChanged(this[name],oldValue,options.hasChanged)){if(!this._changedProperties.has(name)){this._changedProperties.set(name,oldValue)}// Add to reflecting properties set.
// Note, it's important that every change has a chance to add the
// property to `_reflectingProperties`. This ensures setting
// attribute + property reflects correctly.
if(!0===options.reflect&&!(this._updateState&STATE_IS_REFLECTING_TO_PROPERTY$1)){if(void 0===this._reflectingProperties){this._reflectingProperties=new Map}this._reflectingProperties.set(name,options)}}else{// Abort the request if the property should not be considered changed.
shouldRequestUpdate=!1}}if(!this._hasRequestedUpdate&&shouldRequestUpdate){this._enqueueUpdate()}}/**
    * Requests an update which is processed asynchronously. This should
    * be called when an element should update based on some state not triggered
    * by setting a property. In this case, pass no arguments. It should also be
    * called when manually implementing a property setter. In this case, pass the
    * property `name` and `oldValue` to ensure that any configured property
    * options are honored. Returns the `updateComplete` Promise which is resolved
    * when the update completes.
    *
    * @param name {PropertyKey} (optional) name of requesting property
    * @param oldValue {any} (optional) old value of requesting property
    * @returns {Promise} A Promise that is resolved when the update completes.
    */requestUpdate(name,oldValue){this._requestUpdate(name,oldValue);return this.updateComplete}/**
    * Sets up the element to asynchronously update.
    */async _enqueueUpdate(){// Mark state updating...
this._updateState=this._updateState|STATE_UPDATE_REQUESTED$1;let resolve,reject;const previousUpdatePromise=this._updatePromise;this._updatePromise=new Promise((res,rej)=>{resolve=res;reject=rej});try{// Ensure any previous update has resolved before updating.
// This `await` also ensures that property changes are batched.
await previousUpdatePromise}catch(e){}// Ignore any previous errors. We only care that the previous cycle is
// done. Any error should have been handled in the previous update.
// Make sure the element has connected before updating.
if(!this._hasConnected){await new Promise(res=>this._hasConnectedResolver=res)}try{const result=this.performUpdate();// If `performUpdate` returns a Promise, we await it. This is done to
// enable coordinating updates with a scheduler. Note, the result is
// checked to avoid delaying an additional microtask unless we need to.
if(null!=result){await result}}catch(e){reject(e)}resolve(!this._hasRequestedUpdate)}get _hasConnected(){return this._updateState&STATE_HAS_CONNECTED$1}get _hasRequestedUpdate(){return this._updateState&STATE_UPDATE_REQUESTED$1}get hasUpdated(){return this._updateState&STATE_HAS_UPDATED$1}/**
    * Performs an element update. Note, if an exception is thrown during the
    * update, `firstUpdated` and `updated` will not be called.
    *
    * You can override this method to change the timing of updates. If this
    * method is overridden, `super.performUpdate()` must be called.
    *
    * For instance, to schedule updates to occur just before the next frame:
    *
    * ```
    * protected async performUpdate(): Promise<unknown> {
    *   await new Promise((resolve) => requestAnimationFrame(() => resolve()));
    *   super.performUpdate();
    * }
    * ```
    */performUpdate(){// Mixin instance properties once, if they exist.
if(this._instanceProperties){this._applyInstanceProperties()}let shouldUpdate=!1;const changedProperties=this._changedProperties;try{shouldUpdate=this.shouldUpdate(changedProperties);if(shouldUpdate){this.update(changedProperties)}}catch(e){// Prevent `firstUpdated` and `updated` from running when there's an
// update exception.
shouldUpdate=!1;throw e}finally{// Ensure element can accept additional updates after an exception.
this._markUpdated()}if(shouldUpdate){if(!(this._updateState&STATE_HAS_UPDATED$1)){this._updateState=this._updateState|STATE_HAS_UPDATED$1;this.firstUpdated(changedProperties)}this.updated(changedProperties)}}_markUpdated(){this._changedProperties=new Map;this._updateState=this._updateState&~STATE_UPDATE_REQUESTED$1}/**
    * Returns a Promise that resolves when the element has completed updating.
    * The Promise value is a boolean that is `true` if the element completed the
    * update without triggering another update. The Promise result is `false` if
    * a property was set inside `updated()`. If the Promise is rejected, an
    * exception was thrown during the update. This getter can be implemented to
    * await additional state. For example, it is sometimes useful to await a
    * rendered element before fulfilling this Promise. To do this, first await
    * `super.updateComplete` then any subsequent state.
    *
    * @returns {Promise} The Promise returns a boolean that indicates if the
    * update resolved without triggering another update.
    */get updateComplete(){return this._updatePromise}/**
    * Controls whether or not `update` should be called when the element requests
    * an update. By default, this method always returns `true`, but this can be
    * customized to control when to update.
    *
    * * @param _changedProperties Map of changed properties with old values
    */shouldUpdate(_changedProperties){return!0}/**
    * Updates the element. This method reflects property values to attributes.
    * It can be overridden to render and keep updated element DOM.
    * Setting properties inside this method will *not* trigger
    * another update.
    *
    * * @param _changedProperties Map of changed properties with old values
    */update(_changedProperties){if(void 0!==this._reflectingProperties&&0<this._reflectingProperties.size){// Use forEach so this works even if for/of loops are compiled to for
// loops expecting arrays
this._reflectingProperties.forEach((v,k)=>this._propertyToAttribute(k,this[k],v));this._reflectingProperties=void 0}}/**
    * Invoked whenever the element is updated. Implement to perform
    * post-updating tasks via DOM APIs, for example, focusing an element.
    *
    * Setting properties inside this method will trigger the element to update
    * again after this update cycle completes.
    *
    * * @param _changedProperties Map of changed properties with old values
    */updated(_changedProperties){}/**
                                 * Invoked when the element is first updated. Implement to perform one time
                                 * work on the element after update.
                                 *
                                 * Setting properties inside this method will trigger the element to update
                                 * again after this update cycle completes.
                                 *
                                 * * @param _changedProperties Map of changed properties with old values
                                 */firstUpdated(_changedProperties){}}/**
  * Marks class as having finished creating properties.
  */UpdatingElement$1.finalized=!0;var updatingElement$1={defaultConverter:defaultConverter$1,notEqual:notEqual$1,UpdatingElement:UpdatingElement$1};/**
   * @license
   * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
   * This code may only be used under the BSD style license found at
   * http://polymer.github.io/LICENSE.txt
   * The complete set of authors may be found at
   * http://polymer.github.io/AUTHORS.txt
   * The complete set of contributors may be found at
   * http://polymer.github.io/CONTRIBUTORS.txt
   * Code distributed by Google as part of the polymer project is also
   * subject to an additional IP rights grant found at
   * http://polymer.github.io/PATENTS.txt
   */const directives$1=new WeakMap,directive$2=f=>(...args)=>{const d=f(...args);directives$1.set(d,!0);return d},isDirective$1=o=>{return"function"===typeof o&&directives$1.has(o)};/**
   * Brands a function as a directive factory function so that lit-html will call
   * the function during template rendering, rather than passing as a value.
   *
   * A _directive_ is a function that takes a Part as an argument. It has the
   * signature: `(part: Part) => void`.
   *
   * A directive _factory_ is a function that takes arguments for data and
   * configuration and returns a directive. Users of directive usually refer to
   * the directive factory as the directive. For example, "The repeat directive".
   *
   * Usually a template author will invoke a directive factory in their template
   * with relevant arguments, which will then return a directive function.
   *
   * Here's an example of using the `repeat()` directive factory that takes an
   * array and a function to render an item:
   *
   * ```js
   * html`<ul><${repeat(items, (item) => html`<li>${item}</li>`)}</ul>`
   * ```
   *
   * When `repeat` is invoked, it returns a directive function that closes over
   * `items` and the template function. When the outer template is rendered, the
   * return directive function is called with the Part for the expression.
   * `repeat` then performs it's custom logic to render multiple items.
   *
   * @param f The directive factory function. Must be a function that returns a
   * function of the signature `(part: Part) => void`. The returned function will
   * be called with the part object.
   *
   * @example
   *
   * import {directive, html} from 'lit-html';
   *
   * const immutable = directive((v) => (part) => {
   *   if (part.value !== v) {
   *     part.setValue(v)
   *   }
   * });
   */var directive$1$1={directive:directive$2,isDirective:isDirective$1};/**
   * @license
   * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
   * This code may only be used under the BSD style license found at
   * http://polymer.github.io/LICENSE.txt
   * The complete set of authors may be found at
   * http://polymer.github.io/AUTHORS.txt
   * The complete set of contributors may be found at
   * http://polymer.github.io/CONTRIBUTORS.txt
   * Code distributed by Google as part of the polymer project is also
   * subject to an additional IP rights grant found at
   * http://polymer.github.io/PATENTS.txt
   */ /**
       * True if the custom elements polyfill is in use.
       */const isCEPolyfill$1=void 0!==window.customElements&&void 0!==window.customElements.polyfillWrapFlushCallback,reparentNodes$1=(container,start,end=null,before=null)=>{while(start!==end){const n=start.nextSibling;container.insertBefore(start,before);start=n}},removeNodes$1=(container,start,end=null)=>{while(start!==end){const n=start.nextSibling;container.removeChild(start);start=n}};/**
   * Reparents nodes, starting from `start` (inclusive) to `end` (exclusive),
   * into another container (could be the same container), before `before`. If
   * `before` is null, it appends the nodes to the container.
   */var dom$1={isCEPolyfill:isCEPolyfill$1,reparentNodes:reparentNodes$1,removeNodes:removeNodes$1};/**
   * @license
   * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
   * This code may only be used under the BSD style license found at
   * http://polymer.github.io/LICENSE.txt
   * The complete set of authors may be found at
   * http://polymer.github.io/AUTHORS.txt
   * The complete set of contributors may be found at
   * http://polymer.github.io/CONTRIBUTORS.txt
   * Code distributed by Google as part of the polymer project is also
   * subject to an additional IP rights grant found at
   * http://polymer.github.io/PATENTS.txt
   */ /**
       * A sentinel value that signals that a value was handled by a directive and
       * should not be written to the DOM.
       */const noChange$1={},nothing$1={};/**
                      * A sentinel value that signals a NodePart to fully clear its content.
                      */var part$1={noChange:noChange$1,nothing:nothing$1};/**
   * @license
   * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
   * This code may only be used under the BSD style license found at
   * http://polymer.github.io/LICENSE.txt
   * The complete set of authors may be found at
   * http://polymer.github.io/AUTHORS.txt
   * The complete set of contributors may be found at
   * http://polymer.github.io/CONTRIBUTORS.txt
   * Code distributed by Google as part of the polymer project is also
   * subject to an additional IP rights grant found at
   * http://polymer.github.io/PATENTS.txt
   */ /**
       * An expression marker with embedded unique key to avoid collision with
       * possible text in templates.
       */const marker$1=`{{lit-${(Math.random()+"").slice(2)}}}`,nodeMarker$1=`<!--${marker$1}-->`,markerRegex$1=new RegExp(`${marker$1}|${nodeMarker$1}`),boundAttributeSuffix$1="$lit$";/**
                                        * An expression marker used text-positions, multi-binding attributes, and
                                        * attributes with markup-like text values.
                                        */ /**
                                           * An updateable Template that tracks the location of dynamic parts.
                                           */class Template$1{constructor(result,element){this.parts=[];this.element=element;const nodesToRemove=[],stack=[],walker=document.createTreeWalker(element.content,133/* NodeFilter.SHOW_{ELEMENT|COMMENT|TEXT} */,null,!1);// Keeps track of the last index associated with a part. We try to delete
// unnecessary nodes, but we never want to associate two different parts
// to the same index. They must have a constant node between.
let lastPartIndex=0,index=-1,partIndex=0;const{strings,values:{length}}=result;while(partIndex<length){const node=walker.nextNode();if(null===node){// We've exhausted the content inside a nested template element.
// Because we still have parts (the outer for-loop), we know:
// - There is a template in the stack
// - The walker will find a nextNode outside the template
walker.currentNode=stack.pop();continue}index++;if(1===node.nodeType/* Node.ELEMENT_NODE */){if(node.hasAttributes()){const attributes=node.attributes,{length}=attributes;// Per
// https://developer.mozilla.org/en-US/docs/Web/API/NamedNodeMap,
// attributes are not guaranteed to be returned in document order.
// In particular, Edge/IE can return them out of order, so we cannot
// assume a correspondence between part index and attribute index.
let count=0;for(let i=0;i<length;i++){if(endsWith$1(attributes[i].name,boundAttributeSuffix$1)){count++}}while(0<count--){// Get the template literal section leading up to the first
// expression in this attribute
const stringForPart=strings[partIndex],name=lastAttributeNameRegex$1.exec(stringForPart)[2],attributeLookupName=name.toLowerCase()+boundAttributeSuffix$1,attributeValue=node.getAttribute(attributeLookupName);// Find the attribute name
node.removeAttribute(attributeLookupName);const statics=attributeValue.split(markerRegex$1);this.parts.push({type:"attribute",index,name,strings:statics});partIndex+=statics.length-1}}if("TEMPLATE"===node.tagName){stack.push(node);walker.currentNode=node.content}}else if(3===node.nodeType/* Node.TEXT_NODE */){const data=node.data;if(0<=data.indexOf(marker$1)){const parent=node.parentNode,strings=data.split(markerRegex$1),lastIndex=strings.length-1;// Generate a new text node for each literal section
// These nodes are also used as the markers for node parts
for(let i=0;i<lastIndex;i++){let insert,s=strings[i];if(""===s){insert=createMarker$1()}else{const match=lastAttributeNameRegex$1.exec(s);if(null!==match&&endsWith$1(match[2],boundAttributeSuffix$1)){s=s.slice(0,match.index)+match[1]+match[2].slice(0,-boundAttributeSuffix$1.length)+match[3]}insert=document.createTextNode(s)}parent.insertBefore(insert,node);this.parts.push({type:"node",index:++index})}// If there's no text, we must insert a comment to mark our place.
// Else, we can trust it will stick around after cloning.
if(""===strings[lastIndex]){parent.insertBefore(createMarker$1(),node);nodesToRemove.push(node)}else{node.data=strings[lastIndex]}// We have a part for each match found
partIndex+=lastIndex}}else if(8===node.nodeType/* Node.COMMENT_NODE */){if(node.data===marker$1){const parent=node.parentNode;// Add a new marker node to be the startNode of the Part if any of
// the following are true:
//  * We don't have a previousSibling
//  * The previousSibling is already the start of a previous part
if(null===node.previousSibling||index===lastPartIndex){index++;parent.insertBefore(createMarker$1(),node)}lastPartIndex=index;this.parts.push({type:"node",index});// If we don't have a nextSibling, keep this node so we have an end.
// Else, we can remove it to save future costs.
if(null===node.nextSibling){node.data=""}else{nodesToRemove.push(node);index--}partIndex++}else{let i=-1;while(-1!==(i=node.data.indexOf(marker$1,i+1))){// Comment node has a binding marker inside, make an inactive part
// The binding won't work, but subsequent bindings will
// TODO (justinfagnani): consider whether it's even worth it to
// make bindings in comments work
this.parts.push({type:"node",index:-1});partIndex++}}}}// Remove text binding nodes after the walk to not disturb the TreeWalker
for(const n of nodesToRemove){n.parentNode.removeChild(n)}}}const endsWith$1=(str,suffix)=>{const index=str.length-suffix.length;return 0<=index&&str.slice(index)===suffix},isTemplatePartActive$1=part=>-1!==part.index,createMarker$1=()=>document.createComment(""),lastAttributeNameRegex$1=/([ \x09\x0a\x0c\x0d])([^\0-\x1F\x7F-\x9F "'>=/]+)([ \x09\x0a\x0c\x0d]*=[ \x09\x0a\x0c\x0d]*(?:[^ \x09\x0a\x0c\x0d"'`<>=]*|"[^"]*|'[^']*))$/;var template$1={marker:marker$1,nodeMarker:nodeMarker$1,markerRegex:markerRegex$1,boundAttributeSuffix:boundAttributeSuffix$1,Template:Template$1,isTemplatePartActive:isTemplatePartActive$1,createMarker:createMarker$1,lastAttributeNameRegex:lastAttributeNameRegex$1};class TemplateInstance$1{constructor(template,processor,options){this.__parts=[];this.template=template;this.processor=processor;this.options=options}update(values){let i=0;for(const part of this.__parts){if(void 0!==part){part.setValue(values[i])}i++}for(const part of this.__parts){if(void 0!==part){part.commit()}}}_clone(){// There are a number of steps in the lifecycle of a template instance's
// DOM fragment:
//  1. Clone - create the instance fragment
//  2. Adopt - adopt into the main document
//  3. Process - find part markers and create parts
//  4. Upgrade - upgrade custom elements
//  5. Update - set node, attribute, property, etc., values
//  6. Connect - connect to the document. Optional and outside of this
//     method.
//
// We have a few constraints on the ordering of these steps:
//  * We need to upgrade before updating, so that property values will pass
//    through any property setters.
//  * We would like to process before upgrading so that we're sure that the
//    cloned fragment is inert and not disturbed by self-modifying DOM.
//  * We want custom elements to upgrade even in disconnected fragments.
//
// Given these constraints, with full custom elements support we would
// prefer the order: Clone, Process, Adopt, Upgrade, Update, Connect
//
// But Safari dooes not implement CustomElementRegistry#upgrade, so we
// can not implement that order and still have upgrade-before-update and
// upgrade disconnected fragments. So we instead sacrifice the
// process-before-upgrade constraint, since in Custom Elements v1 elements
// must not modify their light DOM in the constructor. We still have issues
// when co-existing with CEv0 elements like Polymer 1, and with polyfills
// that don't strictly adhere to the no-modification rule because shadow
// DOM, which may be created in the constructor, is emulated by being placed
// in the light DOM.
//
// The resulting order is on native is: Clone, Adopt, Upgrade, Process,
// Update, Connect. document.importNode() performs Clone, Adopt, and Upgrade
// in one step.
//
// The Custom Elements v1 polyfill supports upgrade(), so the order when
// polyfilled is the more ideal: Clone, Process, Adopt, Upgrade, Update,
// Connect.
const fragment=isCEPolyfill$1?this.template.element.content.cloneNode(!0):document.importNode(this.template.element.content,!0),stack=[],parts=this.template.parts,walker=document.createTreeWalker(fragment,133/* NodeFilter.SHOW_{ELEMENT|COMMENT|TEXT} */,null,!1);let partIndex=0,nodeIndex=0,part,node=walker.nextNode();// Loop through all the nodes and parts of a template
while(partIndex<parts.length){part=parts[partIndex];if(!isTemplatePartActive$1(part)){this.__parts.push(void 0);partIndex++;continue}// Progress the tree walker until we find our next part's node.
// Note that multiple parts may share the same node (attribute parts
// on a single element), so this loop may not run at all.
while(nodeIndex<part.index){nodeIndex++;if("TEMPLATE"===node.nodeName){stack.push(node);walker.currentNode=node.content}if(null===(node=walker.nextNode())){// We've exhausted the content inside a nested template element.
// Because we still have parts (the outer for-loop), we know:
// - There is a template in the stack
// - The walker will find a nextNode outside the template
walker.currentNode=stack.pop();node=walker.nextNode()}}// We've arrived at our part's node.
if("node"===part.type){const part=this.processor.handleTextExpression(this.options);part.insertAfterNode(node.previousSibling);this.__parts.push(part)}else{this.__parts.push(...this.processor.handleAttributeExpressions(node,part.name,part.strings,this.options))}partIndex++}if(isCEPolyfill$1){document.adoptNode(fragment);customElements.upgrade(fragment)}return fragment}}var templateInstance$1={TemplateInstance:TemplateInstance$1};class TemplateResult$1{constructor(strings,values,type,processor){this.strings=strings;this.values=values;this.type=type;this.processor=processor}/**
    * Returns a string of HTML used to create a `<template>` element.
    */getHTML(){const l=this.strings.length-1;let html="",isCommentBinding=!1;for(let i=0;i<l;i++){const s=this.strings[i],commentOpen=s.lastIndexOf("<!--");// For each binding we want to determine the kind of marker to insert
// into the template source before it's parsed by the browser's HTML
// parser. The marker type is based on whether the expression is in an
// attribute, text, or comment poisition.
//   * For node-position bindings we insert a comment with the marker
//     sentinel as its text content, like <!--{{lit-guid}}-->.
//   * For attribute bindings we insert just the marker sentinel for the
//     first binding, so that we support unquoted attribute bindings.
//     Subsequent bindings can use a comment marker because multi-binding
//     attributes must be quoted.
//   * For comment bindings we insert just the marker sentinel so we don't
//     close the comment.
//
// The following code scans the template source, but is *not* an HTML
// parser. We don't need to track the tree structure of the HTML, only
// whether a binding is inside a comment, and if not, if it appears to be
// the first binding in an attribute.
// We're in comment position if we have a comment open with no following
// comment close. Because <-- can appear in an attribute value there can
// be false positives.
isCommentBinding=(-1<commentOpen||isCommentBinding)&&-1===s.indexOf("-->",commentOpen+1);// Check to see if we have an attribute-like sequence preceeding the
// expression. This can match "name=value" like structures in text,
// comments, and attribute values, so there can be false-positives.
const attributeMatch=lastAttributeNameRegex$1.exec(s);if(null===attributeMatch){// We're only in this branch if we don't have a attribute-like
// preceeding sequence. For comments, this guards against unusual
// attribute values like <div foo="<!--${'bar'}">. Cases like
// <!-- foo=${'bar'}--> are handled correctly in the attribute branch
// below.
html+=s+(isCommentBinding?marker$1:nodeMarker$1)}else{// For attributes we use just a marker sentinel, and also append a
// $lit$ suffix to the name to opt-out of attribute-specific parsing
// that IE and Edge do for style and certain SVG attributes.
html+=s.substr(0,attributeMatch.index)+attributeMatch[1]+attributeMatch[2]+boundAttributeSuffix$1+attributeMatch[3]+marker$1}}html+=this.strings[l];return html}getTemplateElement(){const template=document.createElement("template");template.innerHTML=this.getHTML();return template}}/**
  * A TemplateResult for SVG fragments.
  *
  * This class wraps HTML in an `<svg>` tag in order to parse its contents in the
  * SVG namespace, then modifies the template to remove the `<svg>` tag so that
  * clones only container the original fragment.
  */class SVGTemplateResult$1 extends TemplateResult$1{getHTML(){return`<svg>${super.getHTML()}</svg>`}getTemplateElement(){const template=super.getTemplateElement(),content=template.content,svgElement=content.firstChild;content.removeChild(svgElement);reparentNodes$1(content,svgElement.firstChild);return template}}var templateResult$1={TemplateResult:TemplateResult$1,SVGTemplateResult:SVGTemplateResult$1};const isPrimitive$1=value=>{return null===value||!("object"===typeof value||"function"===typeof value)},isIterable$1=value=>{return Array.isArray(value)||// tslint:disable-next-line:no-any
!!(value&&value[Symbol.iterator])};/**
   * Writes attribute values to the DOM for a group of AttributeParts bound to a
   * single attibute. The value is only set once even if there are multiple parts
   * for an attribute.
   */class AttributeCommitter$1{constructor(element,name,strings){this.dirty=!0;this.element=element;this.name=name;this.strings=strings;this.parts=[];for(let i=0;i<strings.length-1;i++){this.parts[i]=this._createPart()}}/**
    * Creates a single part. Override this to create a differnt type of part.
    */_createPart(){return new AttributePart$1(this)}_getValue(){const strings=this.strings,l=strings.length-1;let text="";for(let i=0;i<l;i++){text+=strings[i];const part=this.parts[i];if(void 0!==part){const v=part.value;if(isPrimitive$1(v)||!isIterable$1(v)){text+="string"===typeof v?v:v+""}else{for(const t of v){text+="string"===typeof t?t:t+""}}}}text+=strings[l];return text}commit(){if(this.dirty){this.dirty=!1;this.element.setAttribute(this.name,this._getValue())}}}/**
  * A Part that controls all or part of an attribute value.
  */class AttributePart$1{constructor(committer){this.value=void 0;this.committer=committer}setValue(value){if(value!==noChange$1&&(!isPrimitive$1(value)||value!==this.value)){this.value=value;// If the value is a not a directive, dirty the committer so that it'll
// call setAttribute. If the value is a directive, it'll dirty the
// committer if it calls setValue().
if(!isDirective$1(value)){this.committer.dirty=!0}}}commit(){while(isDirective$1(this.value)){const directive=this.value;this.value=noChange$1;directive(this)}if(this.value===noChange$1){return}this.committer.commit()}}/**
  * A Part that controls a location within a Node tree. Like a Range, NodePart
  * has start and end locations and can set and update the Nodes between those
  * locations.
  *
  * NodeParts support several value types: primitives, Nodes, TemplateResults,
  * as well as arrays and iterables of those types.
  */class NodePart$1{constructor(options){this.value=void 0;this.__pendingValue=void 0;this.options=options}/**
    * Appends this part into a container.
    *
    * This part must be empty, as its contents are not automatically moved.
    */appendInto(container){this.startNode=container.appendChild(createMarker$1());this.endNode=container.appendChild(createMarker$1())}/**
    * Inserts this part after the `ref` node (between `ref` and `ref`'s next
    * sibling). Both `ref` and its next sibling must be static, unchanging nodes
    * such as those that appear in a literal section of a template.
    *
    * This part must be empty, as its contents are not automatically moved.
    */insertAfterNode(ref){this.startNode=ref;this.endNode=ref.nextSibling}/**
    * Appends this part into a parent part.
    *
    * This part must be empty, as its contents are not automatically moved.
    */appendIntoPart(part){part.__insert(this.startNode=createMarker$1());part.__insert(this.endNode=createMarker$1())}/**
    * Inserts this part after the `ref` part.
    *
    * This part must be empty, as its contents are not automatically moved.
    */insertAfterPart(ref){ref.__insert(this.startNode=createMarker$1());this.endNode=ref.endNode;ref.endNode=this.startNode}setValue(value){this.__pendingValue=value}commit(){while(isDirective$1(this.__pendingValue)){const directive=this.__pendingValue;this.__pendingValue=noChange$1;directive(this)}const value=this.__pendingValue;if(value===noChange$1){return}if(isPrimitive$1(value)){if(value!==this.value){this.__commitText(value)}}else if(value instanceof TemplateResult$1){this.__commitTemplateResult(value)}else if(value instanceof Node){this.__commitNode(value)}else if(isIterable$1(value)){this.__commitIterable(value)}else if(value===nothing$1){this.value=nothing$1;this.clear()}else{// Fallback, will render the string representation
this.__commitText(value)}}__insert(node){this.endNode.parentNode.insertBefore(node,this.endNode)}__commitNode(value){if(this.value===value){return}this.clear();this.__insert(value);this.value=value}__commitText(value){const node=this.startNode.nextSibling;value=null==value?"":value;if(node===this.endNode.previousSibling&&3===node.nodeType/* Node.TEXT_NODE */){// If we only have a single text node between the markers, we can just
// set its value, rather than replacing it.
// TODO(justinfagnani): Can we just check if this.value is primitive?
node.data=value}else{this.__commitNode(document.createTextNode("string"===typeof value?value:value+""))}this.value=value}__commitTemplateResult(value){const template=this.options.templateFactory(value);if(this.value instanceof TemplateInstance$1&&this.value.template===template){this.value.update(value.values)}else{// Make sure we propagate the template processor from the TemplateResult
// so that we use its syntax extension, etc. The template factory comes
// from the render function options so that it can control template
// caching and preprocessing.
const instance=new TemplateInstance$1(template,value.processor,this.options),fragment=instance._clone();instance.update(value.values);this.__commitNode(fragment);this.value=instance}}__commitIterable(value){// For an Iterable, we create a new InstancePart per item, then set its
// value to the item. This is a little bit of overhead for every item in
// an Iterable, but it lets us recurse easily and efficiently update Arrays
// of TemplateResults that will be commonly returned from expressions like:
// array.map((i) => html`${i}`), by reusing existing TemplateInstances.
// If _value is an array, then the previous render was of an
// iterable and _value will contain the NodeParts from the previous
// render. If _value is not an array, clear this part and make a new
// array for NodeParts.
if(!Array.isArray(this.value)){this.value=[];this.clear()}// Lets us keep track of how many items we stamped so we can clear leftover
// items from a previous render
const itemParts=this.value;let partIndex=0,itemPart;for(const item of value){// Try to reuse an existing part
itemPart=itemParts[partIndex];// If no existing part, create a new one
if(void 0===itemPart){itemPart=new NodePart$1(this.options);itemParts.push(itemPart);if(0===partIndex){itemPart.appendIntoPart(this)}else{itemPart.insertAfterPart(itemParts[partIndex-1])}}itemPart.setValue(item);itemPart.commit();partIndex++}if(partIndex<itemParts.length){// Truncate the parts array so _value reflects the current state
itemParts.length=partIndex;this.clear(itemPart&&itemPart.endNode)}}clear(startNode=this.startNode){removeNodes$1(this.startNode.parentNode,startNode.nextSibling,this.endNode)}}/**
  * Implements a boolean attribute, roughly as defined in the HTML
  * specification.
  *
  * If the value is truthy, then the attribute is present with a value of
  * ''. If the value is falsey, the attribute is removed.
  */class BooleanAttributePart$1{constructor(element,name,strings){this.value=void 0;this.__pendingValue=void 0;if(2!==strings.length||""!==strings[0]||""!==strings[1]){throw new Error("Boolean attributes can only contain a single expression")}this.element=element;this.name=name;this.strings=strings}setValue(value){this.__pendingValue=value}commit(){while(isDirective$1(this.__pendingValue)){const directive=this.__pendingValue;this.__pendingValue=noChange$1;directive(this)}if(this.__pendingValue===noChange$1){return}const value=!!this.__pendingValue;if(this.value!==value){if(value){this.element.setAttribute(this.name,"")}else{this.element.removeAttribute(this.name)}this.value=value}this.__pendingValue=noChange$1}}/**
  * Sets attribute values for PropertyParts, so that the value is only set once
  * even if there are multiple parts for a property.
  *
  * If an expression controls the whole property value, then the value is simply
  * assigned to the property under control. If there are string literals or
  * multiple expressions, then the strings are expressions are interpolated into
  * a string first.
  */class PropertyCommitter$1 extends AttributeCommitter$1{constructor(element,name,strings){super(element,name,strings);this.single=2===strings.length&&""===strings[0]&&""===strings[1]}_createPart(){return new PropertyPart$1(this)}_getValue(){if(this.single){return this.parts[0].value}return super._getValue()}commit(){if(this.dirty){this.dirty=!1;// tslint:disable-next-line:no-any
this.element[this.name]=this._getValue()}}}class PropertyPart$1 extends AttributePart$1{}// Detect event listener options support. If the `capture` property is read
// from the options object, then options are supported. If not, then the thrid
// argument to add/removeEventListener is interpreted as the boolean capture
// value so we should only pass the `capture` property.
let eventOptionsSupported$1=!1;try{const options={get capture(){eventOptionsSupported$1=!0;return!1}};// tslint:disable-next-line:no-any
window.addEventListener("test",options,options);// tslint:disable-next-line:no-any
window.removeEventListener("test",options,options)}catch(_e){}class EventPart$1{constructor(element,eventName,eventContext){this.value=void 0;this.__pendingValue=void 0;this.element=element;this.eventName=eventName;this.eventContext=eventContext;this.__boundHandleEvent=e=>this.handleEvent(e)}setValue(value){this.__pendingValue=value}commit(){while(isDirective$1(this.__pendingValue)){const directive=this.__pendingValue;this.__pendingValue=noChange$1;directive(this)}if(this.__pendingValue===noChange$1){return}const newListener=this.__pendingValue,oldListener=this.value,shouldRemoveListener=null==newListener||null!=oldListener&&(newListener.capture!==oldListener.capture||newListener.once!==oldListener.once||newListener.passive!==oldListener.passive),shouldAddListener=null!=newListener&&(null==oldListener||shouldRemoveListener);if(shouldRemoveListener){this.element.removeEventListener(this.eventName,this.__boundHandleEvent,this.__options)}if(shouldAddListener){this.__options=getOptions$1(newListener);this.element.addEventListener(this.eventName,this.__boundHandleEvent,this.__options)}this.value=newListener;this.__pendingValue=noChange$1}handleEvent(event){if("function"===typeof this.value){this.value.call(this.eventContext||this.element,event)}else{this.value.handleEvent(event)}}}// We copy options because of the inconsistent behavior of browsers when reading
// the third argument of add/removeEventListener. IE11 doesn't support options
// at all. Chrome 41 only reads `capture` if the argument is an object.
const getOptions$1=o=>o&&(eventOptionsSupported$1?{capture:o.capture,passive:o.passive,once:o.once}:o.capture);var parts$2={isPrimitive:isPrimitive$1,isIterable:isIterable$1,AttributeCommitter:AttributeCommitter$1,AttributePart:AttributePart$1,NodePart:NodePart$1,BooleanAttributePart:BooleanAttributePart$1,PropertyCommitter:PropertyCommitter$1,PropertyPart:PropertyPart$1,EventPart:EventPart$1};class DefaultTemplateProcessor$1{/**
  * Create parts for an attribute-position binding, given the event, attribute
  * name, and string literals.
  *
  * @param element The element containing the binding
  * @param name  The attribute name
  * @param strings The string literals. There are always at least two strings,
  *   event for fully-controlled bindings with a single expression.
  */handleAttributeExpressions(element,name,strings,options){const prefix=name[0];if("."===prefix){const committer=new PropertyCommitter$1(element,name.slice(1),strings);return committer.parts}if("@"===prefix){return[new EventPart$1(element,name.slice(1),options.eventContext)]}if("?"===prefix){return[new BooleanAttributePart$1(element,name.slice(1),strings)]}const committer=new AttributeCommitter$1(element,name,strings);return committer.parts}/**
    * Create parts for a text-position binding.
    * @param templateFactory
    */handleTextExpression(options){return new NodePart$1(options)}}const defaultTemplateProcessor$2=new DefaultTemplateProcessor$1;var defaultTemplateProcessor$1$1={DefaultTemplateProcessor:DefaultTemplateProcessor$1,defaultTemplateProcessor:defaultTemplateProcessor$2};function templateFactory$2(result){let templateCache=templateCaches$1.get(result.type);if(void 0===templateCache){templateCache={stringsArray:new WeakMap,keyString:new Map};templateCaches$1.set(result.type,templateCache)}let template=templateCache.stringsArray.get(result.strings);if(void 0!==template){return template}// If the TemplateStringsArray is new, generate a key from the strings
// This key is shared between all templates with identical content
const key=result.strings.join(marker$1);// Check if we already have a Template for this key
template=templateCache.keyString.get(key);if(void 0===template){// If we have not seen this key before, create a new Template
template=new Template$1(result,result.getTemplateElement());// Cache the Template for this key
templateCache.keyString.set(key,template)}// Cache all future queries for this TemplateStringsArray
templateCache.stringsArray.set(result.strings,template);return template}const templateCaches$1=new Map;var templateFactory$1$1={templateFactory:templateFactory$2,templateCaches:templateCaches$1};const parts$1$1=new WeakMap,render$3=(result,container,options)=>{let part=parts$1$1.get(container);if(void 0===part){removeNodes$1(container,container.firstChild);parts$1$1.set(container,part=new NodePart$1(Object.assign({templateFactory:templateFactory$2},options)));part.appendInto(container)}part.setValue(result);part.commit()};/**
   * Renders a template to a container.
   *
   * To update a container with new values, reevaluate the template literal and
   * call `render` with the new result.
   *
   * @param result a TemplateResult created by evaluating a template tag like
   *     `html` or `svg`.
   * @param container A DOM parent to render to. The entire contents are either
   *     replaced, or efficiently updated if the same result type was previous
   *     rendered there.
   * @param options RenderOptions for the entire render tree rendered to this
   *     container. Render options must *not* change between renders to the same
   *     container, as those changes will not effect previously rendered DOM.
   */var render$1$1={parts:parts$1$1,render:render$3};// This line will be used in regexes to search for lit-html usage.
// TODO(justinfagnani): inject version number at build time
(window.litHtmlVersions||(window.litHtmlVersions=[])).push("1.0.0");/**
                                                                                     * Interprets a template literal as an HTML template that can efficiently
                                                                                     * render to and update a container.
                                                                                     */const html$1=(strings,...values)=>new TemplateResult$1(strings,values,"html",defaultTemplateProcessor$2),svg$1=(strings,...values)=>new SVGTemplateResult$1(strings,values,"svg",defaultTemplateProcessor$2);/**
                                                                                                                   * Interprets a template literal as an SVG template that can efficiently
                                                                                                                   * render to and update a container.
                                                                                                                   */var litHtml$1={html:html$1,svg:svg$1,DefaultTemplateProcessor:DefaultTemplateProcessor$1,defaultTemplateProcessor:defaultTemplateProcessor$2,directive:directive$2,isDirective:isDirective$1,removeNodes:removeNodes$1,reparentNodes:reparentNodes$1,noChange:noChange$1,nothing:nothing$1,AttributeCommitter:AttributeCommitter$1,AttributePart:AttributePart$1,BooleanAttributePart:BooleanAttributePart$1,EventPart:EventPart$1,isIterable:isIterable$1,isPrimitive:isPrimitive$1,NodePart:NodePart$1,PropertyCommitter:PropertyCommitter$1,PropertyPart:PropertyPart$1,parts:parts$1$1,render:render$3,templateCaches:templateCaches$1,templateFactory:templateFactory$2,TemplateInstance:TemplateInstance$1,SVGTemplateResult:SVGTemplateResult$1,TemplateResult:TemplateResult$1,createMarker:createMarker$1,isTemplatePartActive:isTemplatePartActive$1,Template:Template$1};const walkerNodeFilter$1=133/* NodeFilter.SHOW_{ELEMENT|COMMENT|TEXT} */;/**
                                                                             * Removes the list of nodes from a Template safely. In addition to removing
                                                                             * nodes from the Template, the Template part indices are updated to match
                                                                             * the mutated Template DOM.
                                                                             *
                                                                             * As the template is walked the removal state is tracked and
                                                                             * part indices are adjusted as needed.
                                                                             *
                                                                             * div
                                                                             *   div#1 (remove) <-- start removing (removing node is div#1)
                                                                             *     div
                                                                             *       div#2 (remove)  <-- continue removing (removing node is still div#1)
                                                                             *         div
                                                                             * div <-- stop removing since previous sibling is the removing node (div#1,
                                                                             * removed 4 nodes)
                                                                             */function removeNodesFromTemplate$1(template,nodesToRemove){const{element:{content},parts}=template,walker=document.createTreeWalker(content,walkerNodeFilter$1,null,!1);let partIndex=nextActiveIndexInTemplateParts$1(parts),part=parts[partIndex],nodeIndex=-1,removeCount=0;const nodesToRemoveInTemplate=[];let currentRemovingNode=null;while(walker.nextNode()){nodeIndex++;const node=walker.currentNode;// End removal if stepped past the removing node
if(node.previousSibling===currentRemovingNode){currentRemovingNode=null}// A node to remove was found in the template
if(nodesToRemove.has(node)){nodesToRemoveInTemplate.push(node);// Track node we're removing
if(null===currentRemovingNode){currentRemovingNode=node}}// When removing, increment count by which to adjust subsequent part indices
if(null!==currentRemovingNode){removeCount++}while(void 0!==part&&part.index===nodeIndex){// If part is in a removed node deactivate it by setting index to -1 or
// adjust the index as needed.
part.index=null!==currentRemovingNode?-1:part.index-removeCount;// go to the next active part.
partIndex=nextActiveIndexInTemplateParts$1(parts,partIndex);part=parts[partIndex]}}nodesToRemoveInTemplate.forEach(n=>n.parentNode.removeChild(n))}const countNodes$1=node=>{let count=11===node.nodeType/* Node.DOCUMENT_FRAGMENT_NODE */?0:1;const walker=document.createTreeWalker(node,walkerNodeFilter$1,null,!1);while(walker.nextNode()){count++}return count},nextActiveIndexInTemplateParts$1=(parts,startIndex=-1)=>{for(let i=startIndex+1;i<parts.length;i++){const part=parts[i];if(isTemplatePartActive$1(part)){return i}}return-1};/**
   * Inserts the given node into the Template, optionally before the given
   * refNode. In addition to inserting the node into the Template, the Template
   * part indices are updated to match the mutated Template DOM.
   */function insertNodeIntoTemplate$1(template,node,refNode=null){const{element:{content},parts}=template;// If there's no refNode, then put node at end of template.
// No part indices need to be shifted in this case.
if(null===refNode||void 0===refNode){content.appendChild(node);return}const walker=document.createTreeWalker(content,walkerNodeFilter$1,null,!1);let partIndex=nextActiveIndexInTemplateParts$1(parts),insertCount=0,walkerIndex=-1;while(walker.nextNode()){walkerIndex++;const walkerNode=walker.currentNode;if(walkerNode===refNode){insertCount=countNodes$1(node);refNode.parentNode.insertBefore(node,refNode)}while(-1!==partIndex&&parts[partIndex].index===walkerIndex){// If we've inserted the node, simply adjust all subsequent parts
if(0<insertCount){while(-1!==partIndex){parts[partIndex].index+=insertCount;partIndex=nextActiveIndexInTemplateParts$1(parts,partIndex)}return}partIndex=nextActiveIndexInTemplateParts$1(parts,partIndex)}}}var modifyTemplate$1={removeNodesFromTemplate:removeNodesFromTemplate$1,insertNodeIntoTemplate:insertNodeIntoTemplate$1};const getTemplateCacheKey$1=(type,scopeName)=>`${type}--${scopeName}`;let compatibleShadyCSSVersion$1=!0;if("undefined"===typeof window.ShadyCSS){compatibleShadyCSSVersion$1=!1}else if("undefined"===typeof window.ShadyCSS.prepareTemplateDom){console.warn(`Incompatible ShadyCSS version detected. `+`Please update to at least @webcomponents/webcomponentsjs@2.0.2 and `+`@webcomponents/shadycss@1.3.1.`);compatibleShadyCSSVersion$1=!1}/**
  * Template factory which scopes template DOM using ShadyCSS.
  * @param scopeName {string}
  */const shadyTemplateFactory$1=scopeName=>result=>{const cacheKey=getTemplateCacheKey$1(result.type,scopeName);let templateCache=templateCaches$1.get(cacheKey);if(void 0===templateCache){templateCache={stringsArray:new WeakMap,keyString:new Map};templateCaches$1.set(cacheKey,templateCache)}let template=templateCache.stringsArray.get(result.strings);if(void 0!==template){return template}const key=result.strings.join(marker$1);template=templateCache.keyString.get(key);if(void 0===template){const element=result.getTemplateElement();if(compatibleShadyCSSVersion$1){window.ShadyCSS.prepareTemplateDom(element,scopeName)}template=new Template$1(result,element);templateCache.keyString.set(key,template)}templateCache.stringsArray.set(result.strings,template);return template},TEMPLATE_TYPES$1=["html","svg"],removeStylesFromLitTemplates$1=scopeName=>{TEMPLATE_TYPES$1.forEach(type=>{const templates=templateCaches$1.get(getTemplateCacheKey$1(type,scopeName));if(void 0!==templates){templates.keyString.forEach(template=>{const{element:{content}}=template,styles=new Set;// IE 11 doesn't support the iterable param Set constructor
Array.from(content.querySelectorAll("style")).forEach(s=>{styles.add(s)});removeNodesFromTemplate$1(template,styles)})}})},shadyRenderSet$1=new Set,prepareTemplateStyles$1=(renderedDOM,template,scopeName)=>{shadyRenderSet$1.add(scopeName);// Move styles out of rendered DOM and store.
const styles=renderedDOM.querySelectorAll("style"),{length}=styles;// If there are no styles, skip unnecessary work
if(0===length){// Ensure prepareTemplateStyles is called to support adding
// styles via `prepareAdoptedCssText` since that requires that
// `prepareTemplateStyles` is called.
window.ShadyCSS.prepareTemplateStyles(template.element,scopeName);return}const condensedStyle=document.createElement("style");// Collect styles into a single style. This helps us make sure ShadyCSS
// manipulations will not prevent us from being able to fix up template
// part indices.
// NOTE: collecting styles is inefficient for browsers but ShadyCSS
// currently does this anyway. When it does not, this should be changed.
for(let i=0;i<length;i++){const style=styles[i];style.parentNode.removeChild(style);condensedStyle.textContent+=style.textContent}// Remove styles from nested templates in this scope.
removeStylesFromLitTemplates$1(scopeName);// And then put the condensed style into the "root" template passed in as
// `template`.
const content=template.element.content;insertNodeIntoTemplate$1(template,condensedStyle,content.firstChild);// Note, it's important that ShadyCSS gets the template that `lit-html`
// will actually render so that it can update the style inside when
// needed (e.g. @apply native Shadow DOM case).
window.ShadyCSS.prepareTemplateStyles(template.element,scopeName);const style=content.querySelector("style");if(window.ShadyCSS.nativeShadow&&null!==style){// When in native Shadow DOM, ensure the style created by ShadyCSS is
// included in initially rendered output (`renderedDOM`).
renderedDOM.insertBefore(style.cloneNode(!0),renderedDOM.firstChild)}else{// When no style is left in the template, parts will be broken as a
// result. To fix this, we put back the style node ShadyCSS removed
// and then tell lit to remove that node from the template.
// There can be no style in the template in 2 cases (1) when Shady DOM
// is in use, ShadyCSS removes all styles, (2) when native Shadow DOM
// is in use ShadyCSS removes the style if it contains no content.
// NOTE, ShadyCSS creates its own style so we can safely add/remove
// `condensedStyle` here.
content.insertBefore(condensedStyle,content.firstChild);const removes=new Set([condensedStyle]);removeNodesFromTemplate$1(template,removes)}},render$2$1=(result,container,options)=>{const scopeName=options.scopeName,hasRendered=parts$1$1.has(container),needsScoping=compatibleShadyCSSVersion$1&&11===container.nodeType/* Node.DOCUMENT_FRAGMENT_NODE */&&!!container.host&&result instanceof TemplateResult$1,firstScopeRender=needsScoping&&!shadyRenderSet$1.has(scopeName),renderContainer=firstScopeRender?document.createDocumentFragment():container;render$3(result,renderContainer,Object.assign({templateFactory:shadyTemplateFactory$1(scopeName)},options));// When performing first scope render,
// (1) We've rendered into a fragment so that there's a chance to
// `prepareTemplateStyles` before sub-elements hit the DOM
// (which might cause them to render based on a common pattern of
// rendering in a custom element's `connectedCallback`);
// (2) Scope the template with ShadyCSS one time only for this scope.
// (3) Render the fragment into the container and make sure the
// container knows its `part` is the one we just rendered. This ensures
// DOM will be re-used on subsequent renders.
if(firstScopeRender){const part=parts$1$1.get(renderContainer);parts$1$1.delete(renderContainer);if(part.value instanceof TemplateInstance$1){prepareTemplateStyles$1(renderContainer,part.value.template,scopeName)}removeNodes$1(container,container.firstChild);container.appendChild(renderContainer);parts$1$1.set(container,part)}// After elements have hit the DOM, update styling if this is the
// initial render to this container.
// This is needed whenever dynamic changes are made so it would be
// safest to do every render; however, this would regress performance
// so we leave it up to the user to call `ShadyCSSS.styleElement`
// for dynamic changes.
if(!hasRendered&&needsScoping){window.ShadyCSS.styleElement(container.host)}};var shadyRender$1={render:render$2$1,html:html$1,svg:svg$1,TemplateResult:TemplateResult$1};// IMPORTANT: do not change the property name or the assignment expression.
// This line will be used in regexes to search for LitElement usage.
// TODO(justinfagnani): inject version number at build time
(window.litElementVersions||(window.litElementVersions=[])).push("2.2.0");/**
                                                                                           * Minimal implementation of Array.prototype.flat
                                                                                           * @param arr the array to flatten
                                                                                           * @param result the accumlated result
                                                                                           */function arrayFlat$1(styles,result=[]){for(let i=0,length=styles.length;i<length;i++){const value=styles[i];if(Array.isArray(value)){arrayFlat$1(value,result)}else{result.push(value)}}return result}/** Deeply flattens styles array. Uses native flat if available. */const flattenStyles$1=styles=>styles.flat?styles.flat(1/0):arrayFlat$1(styles);class LitElement$1 extends UpdatingElement$1{/** @nocollapse */static finalize(){super.finalize();// Prepare styling that is stamped at first render time. Styling
// is built from user provided `styles` or is inherited from the superclass.
this._styles=this.hasOwnProperty(JSCompiler_renameProperty("styles",this))?this._getUniqueStyles():this._styles||[]}/** @nocollapse */static _getUniqueStyles(){// Take care not to call `this.styles` multiple times since this generates
// new CSSResults each time.
// TODO(sorvell): Since we do not cache CSSResults by input, any
// shared styles will generate new stylesheet objects, which is wasteful.
// This should be addressed when a browser ships constructable
// stylesheets.
const userStyles=this.styles,styles=[];if(Array.isArray(userStyles)){const flatStyles=flattenStyles$1(userStyles),styleSet=flatStyles.reduceRight((set,s)=>{set.add(s);// on IE set.add does not return the set.
return set},new Set);// As a performance optimization to avoid duplicated styling that can
// occur especially when composing via subclassing, de-duplicate styles
// preserving the last item in the list. The last item is kept to
// try to preserve cascade order with the assumption that it's most
// important that last added styles override previous styles.
// Array.from does not work on Set in IE
styleSet.forEach(v=>styles.unshift(v))}else if(userStyles){styles.push(userStyles)}return styles}/**
    * Performs element initialization. By default this calls `createRenderRoot`
    * to create the element `renderRoot` node and captures any pre-set values for
    * registered properties.
    */initialize(){super.initialize();this.renderRoot=this.createRenderRoot();// Note, if renderRoot is not a shadowRoot, styles would/could apply to the
// element's getRootNode(). While this could be done, we're choosing not to
// support this now since it would require different logic around de-duping.
if(window.ShadowRoot&&this.renderRoot instanceof window.ShadowRoot){this.adoptStyles()}}/**
    * Returns the node into which the element should render and by default
    * creates and returns an open shadowRoot. Implement to customize where the
    * element's DOM is rendered. For example, to render into the element's
    * childNodes, return `this`.
    * @returns {Element|DocumentFragment} Returns a node into which to render.
    */createRenderRoot(){return this.attachShadow({mode:"open"})}/**
    * Applies styling to the element shadowRoot using the `static get styles`
    * property. Styling will apply using `shadowRoot.adoptedStyleSheets` where
    * available and will fallback otherwise. When Shadow DOM is polyfilled,
    * ShadyCSS scopes styles and adds them to the document. When Shadow DOM
    * is available but `adoptedStyleSheets` is not, styles are appended to the
    * end of the `shadowRoot` to [mimic spec
    * behavior](https://wicg.github.io/construct-stylesheets/#using-constructed-stylesheets).
    */adoptStyles(){const styles=this.constructor._styles;if(0===styles.length){return}// There are three separate cases here based on Shadow DOM support.
// (1) shadowRoot polyfilled: use ShadyCSS
// (2) shadowRoot.adoptedStyleSheets available: use it.
// (3) shadowRoot.adoptedStyleSheets polyfilled: append styles after
// rendering
if(void 0!==window.ShadyCSS&&!window.ShadyCSS.nativeShadow){window.ShadyCSS.ScopingShim.prepareAdoptedCssText(styles.map(s=>s.cssText),this.localName)}else if(supportsAdoptingStyleSheets$1){this.renderRoot.adoptedStyleSheets=styles.map(s=>s.styleSheet)}else{// This must be done after rendering so the actual style insertion is done
// in `update`.
this._needsShimAdoptedStyleSheets=!0}}connectedCallback(){super.connectedCallback();// Note, first update/render handles styleElement so we only call this if
// connected after first update.
if(this.hasUpdated&&void 0!==window.ShadyCSS){window.ShadyCSS.styleElement(this)}}/**
    * Updates the element. This method reflects property values to attributes
    * and calls `render` to render DOM via lit-html. Setting properties inside
    * this method will *not* trigger another update.
    * * @param _changedProperties Map of changed properties with old values
    */update(changedProperties){super.update(changedProperties);const templateResult=this.render();if(templateResult instanceof TemplateResult$1){this.constructor.render(templateResult,this.renderRoot,{scopeName:this.localName,eventContext:this})}// When native Shadow DOM is used but adoptedStyles are not supported,
// insert styling after rendering to ensure adoptedStyles have highest
// priority.
if(this._needsShimAdoptedStyleSheets){this._needsShimAdoptedStyleSheets=!1;this.constructor._styles.forEach(s=>{const style=document.createElement("style");style.textContent=s.cssText;this.renderRoot.appendChild(style)})}}/**
    * Invoked on each update to perform rendering tasks. This method must return
    * a lit-html TemplateResult. Setting properties inside this method will *not*
    * trigger the element to update.
    */render(){}}/**
  * Ensure this class is marked as `finalized` as an optimization ensuring
  * it will not needlessly try to `finalize`.
  */LitElement$1.finalized=!0;/**
                             * Render method used to render the lit-html TemplateResult to the element's
                             * DOM.
                             * @param {TemplateResult} Template to render.
                             * @param {Element|DocumentFragment} Node into which to render.
                             * @param {String} Element name.
                             * @nocollapse
                             */LitElement$1.render=render$2$1;var litElement$1={LitElement:LitElement$1,defaultConverter:defaultConverter$1,notEqual:notEqual$1,UpdatingElement:UpdatingElement$1,customElement:customElement$1,property:property$1,query:query$1,queryAll:queryAll$1,eventOptions:eventOptions$1,html:html$1,svg:svg$1,TemplateResult:TemplateResult$1,SVGTemplateResult:SVGTemplateResult$1,supportsAdoptingStyleSheets:supportsAdoptingStyleSheets$1,CSSResult:CSSResult$1,unsafeCSS:unsafeCSS$1,css:css$1},__decorate=function(decorators,target,key,desc){var c=arguments.length,r=3>c?target:null===desc?desc=Object.getOwnPropertyDescriptor(target,key):desc,d;if("object"===typeof Reflect&&"function"===typeof Reflect.decorate)r=Reflect.decorate(decorators,target,key,desc);else for(var i=decorators.length-1;0<=i;i--)if(d=decorators[i])r=(3>c?d(r):3<c?d(target,key,r):d(target,key))||r;return 3<c&&r&&Object.defineProperty(target,key,r),r};let Pho3nixSpinner=class Pho3nixSpinner extends LitElement$1{static get styles(){return[css$1`
        .lds-ripple {
          display: inline-block;
          position: relative;
          width: var(--ripple-size, 64px); /*(16/16)*/
          height: var(--ripple-size, 64px); /*(16/16)*/
        }
        .lds-ripple div {
          position: absolute;
          border-width: calc(var(--ripple-size, 64px) / 16); /*(1/16)*/
          border-style: var(--ripple-style, solid);
          border-color: var(--ripple-color, #fff);
          opacity: 1;
          border-radius: 50%;
          animation: lds-ripple 1s cubic-bezier(0, 0.2, 0.8, 1) infinite;
        }
        .lds-ripple div:nth-child(2) {
          animation-delay: -0.5s;
        }
        @keyframes lds-ripple {
          0% {
            top: calc(var(--ripple-size, 64px) * 0.4375); /*(7/16)*/
            left: calc(var(--ripple-size, 64px) * 0.4375); /*(7/16)*/
            width: 0;
            height: 0;
            opacity: 1;
          }
          100% {
            top: -1px;
            left: -1px;
            width: calc(var(--ripple-size, 64px) * 0.8750); /*(14/16)*/
            height: calc(var(--ripple-size, 64px) * 0.8750); /*(14/16)*/
            opacity: 0;
          }
        }
      `]}render(){return html$1`<div class="lds-ripple"><div></div><div></div></div>`}};Pho3nixSpinner=__decorate([customElement$1("pho3nix-spinner")],Pho3nixSpinner);var pho3nixSpinner={get Pho3nixSpinner(){return Pho3nixSpinner}},pho3nixSpinner$1={$cssTag:cssTag$1,$decorators:decorators$1,$defaultTemplateProcessor:defaultTemplateProcessor$1$1,$directive:directive$1$1,$dom:dom$1,$litElement:litElement$1,$litHtml:litHtml$1,$modifyTemplate:modifyTemplate$1,$part:part$1,$parts:parts$2,$pho3nixSpinner:pho3nixSpinner,$render:render$1$1,$shadyRender:shadyRender$1,$template:template$1,$templateFactory:templateFactory$1$1,$templateInstance:templateInstance$1,$templateResult:templateResult$1,$updatingElement:updatingElement$1,AttributeCommitter:AttributeCommitter$1,AttributeCommitter$1:AttributeCommitter$1,AttributePart:AttributePart$1,AttributePart$1:AttributePart$1,BooleanAttributePart:BooleanAttributePart$1,BooleanAttributePart$1:BooleanAttributePart$1,CSSResult:CSSResult$1,CSSResult$1:CSSResult$1,DefaultTemplateProcessor:DefaultTemplateProcessor$1,DefaultTemplateProcessor$1:DefaultTemplateProcessor$1,EventPart:EventPart$1,EventPart$1:EventPart$1,LitElement:LitElement$1,NodePart:NodePart$1,NodePart$1:NodePart$1,get Pho3nixSpinner(){return Pho3nixSpinner},PropertyCommitter:PropertyCommitter$1,PropertyCommitter$1:PropertyCommitter$1,PropertyPart:PropertyPart$1,PropertyPart$1:PropertyPart$1,SVGTemplateResult:SVGTemplateResult$1,SVGTemplateResult$1:SVGTemplateResult$1,SVGTemplateResult$2:SVGTemplateResult$1,Template:Template$1,Template$1:Template$1,TemplateInstance:TemplateInstance$1,TemplateInstance$1:TemplateInstance$1,TemplateResult:TemplateResult$1,TemplateResult$1:TemplateResult$1,TemplateResult$2:TemplateResult$1,TemplateResult$3:TemplateResult$1,UpdatingElement:UpdatingElement$1,UpdatingElement$1:UpdatingElement$1,boundAttributeSuffix:boundAttributeSuffix$1,createMarker:createMarker$1,createMarker$1:createMarker$1,css:css$1,css$1:css$1,customElement:customElement$1,customElement$1:customElement$1,defaultConverter:defaultConverter$1,defaultConverter$1:defaultConverter$1,defaultTemplateProcessor:defaultTemplateProcessor$2,defaultTemplateProcessor$1:defaultTemplateProcessor$2,directive:directive$2,directive$1:directive$2,eventOptions:eventOptions$1,eventOptions$1:eventOptions$1,html:html$1,html$1:html$1,html$2:html$1,insertNodeIntoTemplate:insertNodeIntoTemplate$1,isCEPolyfill:isCEPolyfill$1,isDirective:isDirective$1,isDirective$1:isDirective$1,isIterable:isIterable$1,isIterable$1:isIterable$1,isPrimitive:isPrimitive$1,isPrimitive$1:isPrimitive$1,isTemplatePartActive:isTemplatePartActive$1,isTemplatePartActive$1:isTemplatePartActive$1,lastAttributeNameRegex:lastAttributeNameRegex$1,marker:marker$1,markerRegex:markerRegex$1,noChange:noChange$1,noChange$1:noChange$1,nodeMarker:nodeMarker$1,notEqual:notEqual$1,notEqual$1:notEqual$1,nothing:nothing$1,nothing$1:nothing$1,parts:parts$1$1,parts$1:parts$1$1,property:property$1,property$1:property$1,query:query$1,query$1:query$1,queryAll:queryAll$1,queryAll$1:queryAll$1,removeNodes:removeNodes$1,removeNodes$1:removeNodes$1,removeNodesFromTemplate:removeNodesFromTemplate$1,render:render$3,render$1:render$2$1,render$2:render$3,reparentNodes:reparentNodes$1,reparentNodes$1:reparentNodes$1,supportsAdoptingStyleSheets:supportsAdoptingStyleSheets$1,supportsAdoptingStyleSheets$1:supportsAdoptingStyleSheets$1,svg:svg$1,svg$1:svg$1,svg$2:svg$1,templateCaches:templateCaches$1,templateCaches$1:templateCaches$1,templateFactory:templateFactory$2,templateFactory$1:templateFactory$2,unsafeCSS:unsafeCSS$1,unsafeCSS$1:unsafeCSS$1};/*! showdown v 2.0.0-alpha1 - 24-10-2018 */ /**
                                                * Created by Tivie on 13-07-2015.
                                                */function getDefaultOpts(simple){'use strict';var defaultOptions={omitExtraWLInCodeBlocks:{defaultValue:!1,describe:"Omit the default extra whiteline added to code blocks",type:"boolean"},noHeaderId:{defaultValue:!1,describe:"Turn on/off generated header id",type:"boolean"},prefixHeaderId:{defaultValue:!1,describe:"Add a prefix to the generated header ids. Passing a string will prefix that string to the header id. Setting to true will add a generic 'section-' prefix",type:"string"},rawPrefixHeaderId:{defaultValue:!1,describe:"Setting this option to true will prevent showdown from modifying the prefix. This might result in malformed IDs (if, for instance, the \" char is used in the prefix)",type:"boolean"},ghCompatibleHeaderId:{defaultValue:!1,describe:"Generate header ids compatible with github style (spaces are replaced with dashes, a bunch of non alphanumeric chars are removed)",type:"boolean"},rawHeaderId:{defaultValue:!1,describe:"Remove only spaces, ' and \" from generated header ids (including prefixes), replacing them with dashes (-). WARNING: This might result in malformed ids",type:"boolean"},headerLevelStart:{defaultValue:!1,describe:"The header blocks level start",type:"integer"},parseImgDimensions:{defaultValue:!1,describe:"Turn on/off image dimension parsing",type:"boolean"},simplifiedAutoLink:{defaultValue:!1,describe:"Turn on/off GFM autolink style",type:"boolean"},literalMidWordUnderscores:{defaultValue:!1,describe:"Parse midword underscores as literal underscores",type:"boolean"},literalMidWordAsterisks:{defaultValue:!1,describe:"Parse midword asterisks as literal asterisks",type:"boolean"},strikethrough:{defaultValue:!1,describe:"Turn on/off strikethrough support",type:"boolean"},tables:{defaultValue:!1,describe:"Turn on/off tables support",type:"boolean"},tablesHeaderId:{defaultValue:!1,describe:"Add an id to table headers",type:"boolean"},ghCodeBlocks:{defaultValue:!0,describe:"Turn on/off GFM fenced code blocks support",type:"boolean"},tasklists:{defaultValue:!1,describe:"Turn on/off GFM tasklist support",type:"boolean"},smoothLivePreview:{defaultValue:!1,describe:"Prevents weird effects in live previews due to incomplete input",type:"boolean"},smartIndentationFix:{defaultValue:!1,description:"Tries to smartly fix indentation in es6 strings",type:"boolean"},disableForced4SpacesIndentedSublists:{defaultValue:!1,description:"Disables the requirement of indenting nested sublists by 4 spaces",type:"boolean"},simpleLineBreaks:{defaultValue:!1,description:"Parses simple line breaks as <br> (GFM Style)",type:"boolean"},requireSpaceBeforeHeadingText:{defaultValue:!1,description:"Makes adding a space between `#` and the header text mandatory (GFM Style)",type:"boolean"},ghMentions:{defaultValue:!1,description:"Enables github @mentions",type:"boolean"},ghMentionsLink:{defaultValue:"https://github.com/{u}",description:"Changes the link generated by @mentions. Only applies if ghMentions option is enabled.",type:"string"},encodeEmails:{defaultValue:!0,description:"Encode e-mail addresses through the use of Character Entities, transforming ASCII e-mail addresses into its equivalent decimal entities",type:"boolean"},openLinksInNewWindow:{defaultValue:!1,description:"Open all links in new windows",type:"boolean"},backslashEscapesHTMLTags:{defaultValue:!1,description:"Support for HTML Tag escaping. ex: <div>foo</div>",type:"boolean"},emoji:{defaultValue:!1,description:"Enable emoji support. Ex: `this is a :smile: emoji`",type:"boolean"},underline:{defaultValue:!1,description:"Enable support for underline. Syntax is double or triple underscores: `__underline word__`. With this option enabled, underscores no longer parses into `<em>` and `<strong>`",type:"boolean"},completeHTMLDocument:{defaultValue:!1,description:"Outputs a complete html document, including `<html>`, `<head>` and `<body>` tags",type:"boolean"},metadata:{defaultValue:!1,description:"Enable support for document metadata (defined at the top of the document between `\xAB\xAB\xAB` and `\xBB\xBB\xBB` or between `---` and `---`).",type:"boolean"},splitAdjacentBlockquotes:{defaultValue:!1,description:"Split adjacent blockquote blocks",type:"boolean"}};if(!1===simple){return JSON.parse(JSON.stringify(defaultOptions))}var ret={};for(var opt in defaultOptions){if(defaultOptions.hasOwnProperty(opt)){ret[opt]=defaultOptions[opt].defaultValue}}return ret}function allOptionsOn(){'use strict';var options=getDefaultOpts(!0),ret={};for(var opt in options){if(options.hasOwnProperty(opt)){ret[opt]=!0}}return ret}/**
   * Created by Tivie on 06-01-2015.
   */ // Private properties
var showdown={},parsers={},extensions={},globalOptions=getDefaultOpts(!0),setFlavor="vanilla",flavor={github:{omitExtraWLInCodeBlocks:!0,simplifiedAutoLink:!0,literalMidWordUnderscores:!0,strikethrough:!0,tables:!0,tablesHeaderId:!0,ghCodeBlocks:!0,tasklists:!0,disableForced4SpacesIndentedSublists:!0,simpleLineBreaks:!0,requireSpaceBeforeHeadingText:!0,ghCompatibleHeaderId:!0,ghMentions:!0,backslashEscapesHTMLTags:!0,emoji:!0,splitAdjacentBlockquotes:!0},original:{noHeaderId:!0,ghCodeBlocks:!1},ghost:{omitExtraWLInCodeBlocks:!0,parseImgDimensions:!0,simplifiedAutoLink:!0,literalMidWordUnderscores:!0,strikethrough:!0,tables:!0,tablesHeaderId:!0,ghCodeBlocks:!0,tasklists:!0,smoothLivePreview:!0,simpleLineBreaks:!0,requireSpaceBeforeHeadingText:!0,ghMentions:!1,encodeEmails:!0},vanilla:getDefaultOpts(!0),allOn:allOptionsOn()};/**
    * helper namespace
    * @type {{}}
    */showdown.helper={};/**
                       * TODO LEGACY SUPPORT CODE
                       * @type {{}}
                       */showdown.extensions={};/**
                           * Set a global option
                           * @static
                           * @param {string} key
                           * @param {*} value
                           * @returns {showdown}
                           */showdown.setOption=function(key,value){'use strict';globalOptions[key]=value;return this};/**
    * Get a global option
    * @static
    * @param {string} key
    * @returns {*}
    */showdown.getOption=function(key){'use strict';return globalOptions[key]};/**
    * Get the global options
    * @static
    * @returns {{}}
    */showdown.getOptions=function(){'use strict';return globalOptions};/**
    * Reset global options to the default values
    * @static
    */showdown.resetOptions=function(){'use strict';globalOptions=getDefaultOpts(!0)};/**
    * Set the flavor showdown should use as default
    * @param {string} name
    */showdown.setFlavor=function(name){'use strict';if(!flavor.hasOwnProperty(name)){throw Error(name+" flavor was not found")}showdown.resetOptions();var preset=flavor[name];setFlavor=name;for(var option in preset){if(preset.hasOwnProperty(option)){globalOptions[option]=preset[option]}}};/**
    * Get the currently set flavor
    * @returns {string}
    */showdown.getFlavor=function(){'use strict';return setFlavor};/**
    * Get the options of a specified flavor. Returns undefined if the flavor was not found
    * @param {string} name Name of the flavor
    * @returns {{}|undefined}
    */showdown.getFlavorOptions=function(name){'use strict';if(flavor.hasOwnProperty(name)){return flavor[name]}};/**
    * Get the default options
    * @static
    * @param {boolean} [simple=true]
    * @returns {{}}
    */showdown.getDefaultOptions=function(simple){'use strict';return getDefaultOpts(simple)};/**
    * Get or set a subParser
    *
    * subParser(name)       - Get a registered subParser
    * subParser(name, func) - Register a subParser
    * @static
    * @param {string} name
    * @param {function} [func]
    * @returns {*}
    */showdown.subParser=function(name,func){'use strict';if(showdown.helper.isString(name)){if("undefined"!==typeof func){parsers[name]=func}else{if(parsers.hasOwnProperty(name)){return parsers[name]}else{throw Error("SubParser named "+name+" not registered!")}}}else{throw Error("showdown.subParser function first argument must be a string (the name of the subparser)")}};/**
    * Gets or registers an extension
    * @static
    * @param {string} name
    * @param {object|function=} ext
    * @returns {*}
    */showdown.extension=function(name,ext){'use strict';if(!showdown.helper.isString(name)){throw Error("Extension 'name' must be a string")}name=showdown.helper.stdExtName(name);// Getter
if(showdown.helper.isUndefined(ext)){if(!extensions.hasOwnProperty(name)){throw Error("Extension named "+name+" is not registered!")}return extensions[name];// Setter
}else{// Expand extension if it's wrapped in a function
if("function"===typeof ext){ext=ext()}// Ensure extension is an array
if(!showdown.helper.isArray(ext)){ext=[ext]}var validExtension=validate(ext,name);if(validExtension.valid){extensions[name]=ext}else{throw Error(validExtension.error)}}};/**
    * Gets all extensions registered
    * @returns {{}}
    */showdown.getAllExtensions=function(){'use strict';return extensions};/**
    * Remove an extension
    * @param {string} name
    */showdown.removeExtension=function(name){'use strict';delete extensions[name]};/**
    * Removes all extensions
    */showdown.resetExtensions=function(){'use strict';extensions={}};/**
    * Validate extension
    * @param {array} extension
    * @param {string} name
    * @returns {{valid: boolean, error: string}}
    */function validate(extension,name){'use strict';var errMsg=name?"Error in "+name+" extension->":"Error in unnamed extension",ret={valid:!0,error:""};if(!showdown.helper.isArray(extension)){extension=[extension]}for(var i=0;i<extension.length;++i){var baseMsg=errMsg+" sub-extension "+i+": ",ext=extension[i];if("object"!==typeof ext){ret.valid=!1;ret.error=baseMsg+"must be an object, but "+typeof ext+" given";return ret}if(!showdown.helper.isString(ext.type)){ret.valid=!1;ret.error=baseMsg+"property \"type\" must be a string, but "+typeof ext.type+" given";return ret}var type=ext.type=ext.type.toLowerCase();// normalize extension type
if("language"===type){type=ext.type="lang"}if("html"===type){type=ext.type="output"}if("lang"!==type&&"output"!==type&&"listener"!==type){ret.valid=!1;ret.error=baseMsg+"type "+type+" is not recognized. Valid values: \"lang/language\", \"output/html\" or \"listener\"";return ret}if("listener"===type){if(showdown.helper.isUndefined(ext.listeners)){ret.valid=!1;ret.error=baseMsg+". Extensions of type \"listener\" must have a property called \"listeners\"";return ret}}else{if(showdown.helper.isUndefined(ext.filter)&&showdown.helper.isUndefined(ext.regex)){ret.valid=!1;ret.error=baseMsg+type+" extensions must define either a \"regex\" property or a \"filter\" method";return ret}}if(ext.listeners){if("object"!==typeof ext.listeners){ret.valid=!1;ret.error=baseMsg+"\"listeners\" property must be an object but "+typeof ext.listeners+" given";return ret}for(var ln in ext.listeners){if(ext.listeners.hasOwnProperty(ln)){if("function"!==typeof ext.listeners[ln]){ret.valid=!1;ret.error=baseMsg+"\"listeners\" property must be an hash of [event name]: [callback]. listeners."+ln+" must be a function but "+typeof ext.listeners[ln]+" given";return ret}}}}if(ext.filter){if("function"!==typeof ext.filter){ret.valid=!1;ret.error=baseMsg+"\"filter\" must be a function, but "+typeof ext.filter+" given";return ret}}else if(ext.regex){if(showdown.helper.isString(ext.regex)){ext.regex=new RegExp(ext.regex,"g")}if(!(ext.regex instanceof RegExp)){ret.valid=!1;ret.error=baseMsg+"\"regex\" property must either be a string or a RegExp object, but "+typeof ext.regex+" given";return ret}if(showdown.helper.isUndefined(ext.replace)){ret.valid=!1;ret.error=baseMsg+"\"regex\" extensions must implement a replace string or function";return ret}}}return ret}/**
   * Validate extension
   * @param {object} ext
   * @returns {boolean}
   */showdown.validateExtension=function(ext){'use strict';var validateExtension=validate(ext,null);if(!validateExtension.valid){console.warn(validateExtension.error);return!1}return!0};/**
    * showdownjs helper functions
    */if(!showdown.hasOwnProperty("helper")){showdown.helper={}}showdown.helper.document=window.document;/**
                                             * Check if var is string
                                             * @static
                                             * @param {string} a
                                             * @returns {boolean}
                                             */showdown.helper.isString=function(a){'use strict';return"string"===typeof a||a instanceof String};/**
    * Check if var is a function
    * @static
    * @param {*} a
    * @returns {boolean}
    */showdown.helper.isFunction=function(a){'use strict';var getType={};return a&&"[object Function]"===getType.toString.call(a)};/**
    * isArray helper function
    * @static
    * @param {*} a
    * @returns {boolean}
    */showdown.helper.isArray=function(a){'use strict';return Array.isArray(a)};/**
    * Check if value is undefined
    * @static
    * @param {*} value The value to check.
    * @returns {boolean} Returns `true` if `value` is `undefined`, else `false`.
    */showdown.helper.isUndefined=function(value){'use strict';return"undefined"===typeof value};/**
    * ForEach helper function
    * Iterates over Arrays and Objects (own properties only)
    * @static
    * @param {*} obj
    * @param {function} callback Accepts 3 params: 1. value, 2. key, 3. the original array/object
    */showdown.helper.forEach=function(obj,callback){'use strict';// check if obj is defined
if(showdown.helper.isUndefined(obj)){throw new Error("obj param is required")}if(showdown.helper.isUndefined(callback)){throw new Error("callback param is required")}if(!showdown.helper.isFunction(callback)){throw new Error("callback param must be a function/closure")}if("function"===typeof obj.forEach){obj.forEach(callback)}else if(showdown.helper.isArray(obj)){for(var i=0;i<obj.length;i++){callback(obj[i],i,obj)}}else if("object"===typeof obj){for(var prop in obj){if(obj.hasOwnProperty(prop)){callback(obj[prop],prop,obj)}}}else{throw new Error("obj does not seem to be an array or an iterable object")}};/**
    * Standardidize extension name
    * @static
    * @param {string} s extension name
    * @returns {string}
    */showdown.helper.stdExtName=function(s){'use strict';return s.replace(/[_?*+\/\\.^-]/g,"").replace(/\s/g,"").toLowerCase()};function escapeCharactersCallback(wholeMatch,m1){'use strict';var charCodeToEscape=m1.charCodeAt(0);return"\xA8E"+charCodeToEscape+"E"}/**
   * Callback used to escape characters when passing through String.replace
   * @static
   * @param {string} wholeMatch
   * @param {string} m1
   * @returns {string}
   */showdown.helper.escapeCharactersCallback=escapeCharactersCallback;/**
                                                                      * Escape characters in a string
                                                                      * @static
                                                                      * @param {string} text
                                                                      * @param {string} charsToEscape
                                                                      * @param {boolean} afterBackslash
                                                                      * @returns {XML|string|void|*}
                                                                      */showdown.helper.escapeCharacters=function(text,charsToEscape,afterBackslash){'use strict';// First we have to escape the escape characters so that
// we can build a character class out of them
var regexString="(["+charsToEscape.replace(/([\[\]\\])/g,"\\$1")+"])";if(afterBackslash){regexString="\\\\"+regexString}var regex=new RegExp(regexString,"g");text=text.replace(regex,escapeCharactersCallback);return text};var rgxFindMatchPos=function(str,left,right,flags){'use strict';var f=flags||"",g=-1<f.indexOf("g"),x=new RegExp(left+"|"+right,"g"+f.replace(/g/g,"")),l=new RegExp(left,f.replace(/g/g,"")),pos=[],t,s,m,start,end;do{t=0;while(m=x.exec(str)){if(l.test(m[0])){if(!t++){s=x.lastIndex;start=s-m[0].length}}else if(t){if(! --t){end=m.index+m[0].length;var obj={left:{start:start,end:s},match:{start:s,end:m.index},right:{start:m.index,end:end},wholeMatch:{start:start,end:end}};pos.push(obj);if(!g){return pos}}}}}while(t&&(x.lastIndex=s));return pos};/**
    * matchRecursiveRegExp
    *
    * (c) 2007 Steven Levithan <stevenlevithan.com>
    * MIT License
    *
    * Accepts a string to search, a left and right format delimiter
    * as regex patterns, and optional regex flags. Returns an array
    * of matches, allowing nested instances of left/right delimiters.
    * Use the "g" flag to return all matches, otherwise only the
    * first is returned. Be careful to ensure that the left and
    * right format delimiters produce mutually exclusive matches.
    * Backreferences are not supported within the right delimiter
    * due to how it is internally combined with the left delimiter.
    * When matching strings whose format delimiters are unbalanced
    * to the left or right, the output is intentionally as a
    * conventional regex library with recursion support would
    * produce, e.g. "<<x>" and "<x>>" both produce ["x"] when using
    * "<" and ">" as the delimiters (both strings contain a single,
    * balanced instance of "<x>").
    *
    * examples:
    * matchRecursiveRegExp("test", "\\(", "\\)")
    * returns: []
    * matchRecursiveRegExp("<t<<e>><s>>t<>", "<", ">", "g")
    * returns: ["t<<e>><s>", ""]
    * matchRecursiveRegExp("<div id=\"x\">test</div>", "<div\\b[^>]*>", "</div>", "gi")
    * returns: ["test"]
    */showdown.helper.matchRecursiveRegExp=function(str,left,right,flags){'use strict';for(var matchPos=rgxFindMatchPos(str,left,right,flags),results=[],i=0;i<matchPos.length;++i){results.push([str.slice(matchPos[i].wholeMatch.start,matchPos[i].wholeMatch.end),str.slice(matchPos[i].match.start,matchPos[i].match.end),str.slice(matchPos[i].left.start,matchPos[i].left.end),str.slice(matchPos[i].right.start,matchPos[i].right.end)])}return results};/**
    *
    * @param {string} str
    * @param {string|function} replacement
    * @param {string} left
    * @param {string} right
    * @param {string} flags
    * @returns {string}
    */showdown.helper.replaceRecursiveRegExp=function(str,replacement,left,right,flags){'use strict';if(!showdown.helper.isFunction(replacement)){var repStr=replacement;replacement=function(){return repStr}}var matchPos=rgxFindMatchPos(str,left,right,flags),finalStr=str,lng=matchPos.length;if(0<lng){var bits=[];if(0!==matchPos[0].wholeMatch.start){bits.push(str.slice(0,matchPos[0].wholeMatch.start))}for(var i=0;i<lng;++i){bits.push(replacement(str.slice(matchPos[i].wholeMatch.start,matchPos[i].wholeMatch.end),str.slice(matchPos[i].match.start,matchPos[i].match.end),str.slice(matchPos[i].left.start,matchPos[i].left.end),str.slice(matchPos[i].right.start,matchPos[i].right.end)));if(i<lng-1){bits.push(str.slice(matchPos[i].wholeMatch.end,matchPos[i+1].wholeMatch.start))}}if(matchPos[lng-1].wholeMatch.end<str.length){bits.push(str.slice(matchPos[lng-1].wholeMatch.end))}finalStr=bits.join("")}return finalStr};/**
    * Returns the index within the passed String object of the first occurrence of the specified regex,
    * starting the search at fromIndex. Returns -1 if the value is not found.
    *
    * @param {string} str string to search
    * @param {RegExp} regex Regular expression to search
    * @param {int} [fromIndex = 0] Index to start the search
    * @returns {Number}
    * @throws InvalidArgumentError
    */showdown.helper.regexIndexOf=function(str,regex,fromIndex){'use strict';if(!showdown.helper.isString(str)){throw"InvalidArgumentError: first parameter of showdown.helper.regexIndexOf function must be a string"}if(!1===regex instanceof RegExp){throw"InvalidArgumentError: second parameter of showdown.helper.regexIndexOf function must be an instance of RegExp"}var indexOf=str.substring(fromIndex||0).search(regex);return 0<=indexOf?indexOf+(fromIndex||0):indexOf};/**
    * Splits the passed string object at the defined index, and returns an array composed of the two substrings
    * @param {string} str string to split
    * @param {int} index index to split string at
    * @returns {[string,string]}
    * @throws InvalidArgumentError
    */showdown.helper.splitAtIndex=function(str,index){'use strict';if(!showdown.helper.isString(str)){throw"InvalidArgumentError: first parameter of showdown.helper.regexIndexOf function must be a string"}return[str.substring(0,index),str.substring(index)]};/**
    * Obfuscate an e-mail address through the use of Character Entities,
    * transforming ASCII characters into their equivalent decimal or hex entities.
    *
    * Since it has a random component, subsequent calls to this function produce different results
    *
    * @param {string} mail
    * @returns {string}
    */showdown.helper.encodeEmailAddress=function(mail){'use strict';var encode=[function(ch){return"&#"+ch.charCodeAt(0)+";"},function(ch){return"&#x"+ch.charCodeAt(0).toString(16)+";"},function(ch){return ch}];mail=mail.replace(/./g,function(ch){if("@"===ch){// this *must* be encoded. I insist.
ch=encode[Math.floor(2*Math.random())](ch)}else{var r=Math.random();// roughly 10% raw, 45% hex, 45% dec
ch=.9<r?encode[2](ch):.45<r?encode[1](ch):encode[0](ch)}return ch});return mail};/**
    *
    * @param str
    * @param targetLength
    * @param padString
    * @returns {string}
    */showdown.helper.padEnd=function padEnd(str,targetLength,padString){'use strict';/*jshint bitwise: false*/ // eslint-disable-next-line space-infix-ops
targetLength=targetLength>>0;//floor if number or convert non-number to 0;
/*jshint bitwise: true*/padString=(padString||" ")+"";if(str.length>targetLength){return str+""}else{targetLength=targetLength-str.length;if(targetLength>padString.length){padString+=padString.repeat(targetLength/padString.length);//append to original to ensure we are longer than needed
}return str+""+padString.slice(0,targetLength)}};/**
    * Unescape HTML entities
    * @param txt
    * @returns {string}
    */showdown.helper.unescapeHTMLEntities=function(txt){'use strict';return txt.replace(/&quot;/g,"\"").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&amp;/g,"&")};showdown.helper._hashHTMLSpan=function(html,globals){return"\xA8C"+(globals.gHtmlSpans.push(html)-1)+"C"};/**
    * Showdown's Event Object
    * @param {string} name Name of the event
    * @param {string} text Text
    * @param {{}} params optional. params of the event
    * @constructor
    */showdown.helper.Event=function(name,text,params){'use strict';var regexp=params.regexp||null,matches=params.matches||{},options=params.options||{},converter=params.converter||null,globals=params.globals||{};/**
                                       * Get the name of the event
                                       * @returns {string}
                                       */this.getName=function(){return name};this.getEventName=function(){return name};this._stopExecution=!1;this.parsedText=params.parsedText||null;this.getRegexp=function(){return regexp};this.getOptions=function(){return options};this.getConverter=function(){return converter};this.getGlobals=function(){return globals};this.getCapturedText=function(){return text};this.getText=function(){return text};this.setText=function(newText){text=newText};this.getMatches=function(){return matches};this.setMatches=function(newMatches){matches=newMatches};this.preventDefault=function(bool){this._stopExecution=!bool}};/**
    * POLYFILLS
    */ // use this instead of builtin is undefined for IE8 compatibility
if("undefined"===typeof console){console={warn:function(msg){'use strict';alert(msg)},log:function(msg){'use strict';alert(msg)},error:function(msg){'use strict';throw msg}}}/**
   * Common regexes.
   * We declare some common regexes to improve performance
   */showdown.helper.regexes={asteriskDashTildeAndColon:/([*_:~])/g,asteriskDashAndTilde:/([*_~])/g};/**
    * EMOJIS LIST
    */showdown.helper.emojis={"+1":"\uD83D\uDC4D","-1":"\uD83D\uDC4E",100:"\uD83D\uDCAF",1234:"\uD83D\uDD22","1st_place_medal":"\uD83E\uDD47","2nd_place_medal":"\uD83E\uDD48","3rd_place_medal":"\uD83E\uDD49","8ball":"\uD83C\uDFB1",a:"\uD83C\uDD70\uFE0F",ab:"\uD83C\uDD8E",abc:"\uD83D\uDD24",abcd:"\uD83D\uDD21",accept:"\uD83C\uDE51",aerial_tramway:"\uD83D\uDEA1",airplane:"\u2708\uFE0F",alarm_clock:"\u23F0",alembic:"\u2697\uFE0F",alien:"\uD83D\uDC7D",ambulance:"\uD83D\uDE91",amphora:"\uD83C\uDFFA",anchor:"\u2693\uFE0F",angel:"\uD83D\uDC7C",anger:"\uD83D\uDCA2",angry:"\uD83D\uDE20",anguished:"\uD83D\uDE27",ant:"\uD83D\uDC1C",apple:"\uD83C\uDF4E",aquarius:"\u2652\uFE0F",aries:"\u2648\uFE0F",arrow_backward:"\u25C0\uFE0F",arrow_double_down:"\u23EC",arrow_double_up:"\u23EB",arrow_down:"\u2B07\uFE0F",arrow_down_small:"\uD83D\uDD3D",arrow_forward:"\u25B6\uFE0F",arrow_heading_down:"\u2935\uFE0F",arrow_heading_up:"\u2934\uFE0F",arrow_left:"\u2B05\uFE0F",arrow_lower_left:"\u2199\uFE0F",arrow_lower_right:"\u2198\uFE0F",arrow_right:"\u27A1\uFE0F",arrow_right_hook:"\u21AA\uFE0F",arrow_up:"\u2B06\uFE0F",arrow_up_down:"\u2195\uFE0F",arrow_up_small:"\uD83D\uDD3C",arrow_upper_left:"\u2196\uFE0F",arrow_upper_right:"\u2197\uFE0F",arrows_clockwise:"\uD83D\uDD03",arrows_counterclockwise:"\uD83D\uDD04",art:"\uD83C\uDFA8",articulated_lorry:"\uD83D\uDE9B",artificial_satellite:"\uD83D\uDEF0",astonished:"\uD83D\uDE32",athletic_shoe:"\uD83D\uDC5F",atm:"\uD83C\uDFE7",atom_symbol:"\u269B\uFE0F",avocado:"\uD83E\uDD51",b:"\uD83C\uDD71\uFE0F",baby:"\uD83D\uDC76",baby_bottle:"\uD83C\uDF7C",baby_chick:"\uD83D\uDC24",baby_symbol:"\uD83D\uDEBC",back:"\uD83D\uDD19",bacon:"\uD83E\uDD53",badminton:"\uD83C\uDFF8",baggage_claim:"\uD83D\uDEC4",baguette_bread:"\uD83E\uDD56",balance_scale:"\u2696\uFE0F",balloon:"\uD83C\uDF88",ballot_box:"\uD83D\uDDF3",ballot_box_with_check:"\u2611\uFE0F",bamboo:"\uD83C\uDF8D",banana:"\uD83C\uDF4C",bangbang:"\u203C\uFE0F",bank:"\uD83C\uDFE6",bar_chart:"\uD83D\uDCCA",barber:"\uD83D\uDC88",baseball:"\u26BE\uFE0F",basketball:"\uD83C\uDFC0",basketball_man:"\u26F9\uFE0F",basketball_woman:"\u26F9\uFE0F&zwj;\u2640\uFE0F",bat:"\uD83E\uDD87",bath:"\uD83D\uDEC0",bathtub:"\uD83D\uDEC1",battery:"\uD83D\uDD0B",beach_umbrella:"\uD83C\uDFD6",bear:"\uD83D\uDC3B",bed:"\uD83D\uDECF",bee:"\uD83D\uDC1D",beer:"\uD83C\uDF7A",beers:"\uD83C\uDF7B",beetle:"\uD83D\uDC1E",beginner:"\uD83D\uDD30",bell:"\uD83D\uDD14",bellhop_bell:"\uD83D\uDECE",bento:"\uD83C\uDF71",biking_man:"\uD83D\uDEB4",bike:"\uD83D\uDEB2",biking_woman:"\uD83D\uDEB4&zwj;\u2640\uFE0F",bikini:"\uD83D\uDC59",biohazard:"\u2623\uFE0F",bird:"\uD83D\uDC26",birthday:"\uD83C\uDF82",black_circle:"\u26AB\uFE0F",black_flag:"\uD83C\uDFF4",black_heart:"\uD83D\uDDA4",black_joker:"\uD83C\uDCCF",black_large_square:"\u2B1B\uFE0F",black_medium_small_square:"\u25FE\uFE0F",black_medium_square:"\u25FC\uFE0F",black_nib:"\u2712\uFE0F",black_small_square:"\u25AA\uFE0F",black_square_button:"\uD83D\uDD32",blonde_man:"\uD83D\uDC71",blonde_woman:"\uD83D\uDC71&zwj;\u2640\uFE0F",blossom:"\uD83C\uDF3C",blowfish:"\uD83D\uDC21",blue_book:"\uD83D\uDCD8",blue_car:"\uD83D\uDE99",blue_heart:"\uD83D\uDC99",blush:"\uD83D\uDE0A",boar:"\uD83D\uDC17",boat:"\u26F5\uFE0F",bomb:"\uD83D\uDCA3",book:"\uD83D\uDCD6",bookmark:"\uD83D\uDD16",bookmark_tabs:"\uD83D\uDCD1",books:"\uD83D\uDCDA",boom:"\uD83D\uDCA5",boot:"\uD83D\uDC62",bouquet:"\uD83D\uDC90",bowing_man:"\uD83D\uDE47",bow_and_arrow:"\uD83C\uDFF9",bowing_woman:"\uD83D\uDE47&zwj;\u2640\uFE0F",bowling:"\uD83C\uDFB3",boxing_glove:"\uD83E\uDD4A",boy:"\uD83D\uDC66",bread:"\uD83C\uDF5E",bride_with_veil:"\uD83D\uDC70",bridge_at_night:"\uD83C\uDF09",briefcase:"\uD83D\uDCBC",broken_heart:"\uD83D\uDC94",bug:"\uD83D\uDC1B",building_construction:"\uD83C\uDFD7",bulb:"\uD83D\uDCA1",bullettrain_front:"\uD83D\uDE85",bullettrain_side:"\uD83D\uDE84",burrito:"\uD83C\uDF2F",bus:"\uD83D\uDE8C",business_suit_levitating:"\uD83D\uDD74",busstop:"\uD83D\uDE8F",bust_in_silhouette:"\uD83D\uDC64",busts_in_silhouette:"\uD83D\uDC65",butterfly:"\uD83E\uDD8B",cactus:"\uD83C\uDF35",cake:"\uD83C\uDF70",calendar:"\uD83D\uDCC6",call_me_hand:"\uD83E\uDD19",calling:"\uD83D\uDCF2",camel:"\uD83D\uDC2B",camera:"\uD83D\uDCF7",camera_flash:"\uD83D\uDCF8",camping:"\uD83C\uDFD5",cancer:"\u264B\uFE0F",candle:"\uD83D\uDD6F",candy:"\uD83C\uDF6C",canoe:"\uD83D\uDEF6",capital_abcd:"\uD83D\uDD20",capricorn:"\u2651\uFE0F",car:"\uD83D\uDE97",card_file_box:"\uD83D\uDDC3",card_index:"\uD83D\uDCC7",card_index_dividers:"\uD83D\uDDC2",carousel_horse:"\uD83C\uDFA0",carrot:"\uD83E\uDD55",cat:"\uD83D\uDC31",cat2:"\uD83D\uDC08",cd:"\uD83D\uDCBF",chains:"\u26D3",champagne:"\uD83C\uDF7E",chart:"\uD83D\uDCB9",chart_with_downwards_trend:"\uD83D\uDCC9",chart_with_upwards_trend:"\uD83D\uDCC8",checkered_flag:"\uD83C\uDFC1",cheese:"\uD83E\uDDC0",cherries:"\uD83C\uDF52",cherry_blossom:"\uD83C\uDF38",chestnut:"\uD83C\uDF30",chicken:"\uD83D\uDC14",children_crossing:"\uD83D\uDEB8",chipmunk:"\uD83D\uDC3F",chocolate_bar:"\uD83C\uDF6B",christmas_tree:"\uD83C\uDF84",church:"\u26EA\uFE0F",cinema:"\uD83C\uDFA6",circus_tent:"\uD83C\uDFAA",city_sunrise:"\uD83C\uDF07",city_sunset:"\uD83C\uDF06",cityscape:"\uD83C\uDFD9",cl:"\uD83C\uDD91",clamp:"\uD83D\uDDDC",clap:"\uD83D\uDC4F",clapper:"\uD83C\uDFAC",classical_building:"\uD83C\uDFDB",clinking_glasses:"\uD83E\uDD42",clipboard:"\uD83D\uDCCB",clock1:"\uD83D\uDD50",clock10:"\uD83D\uDD59",clock1030:"\uD83D\uDD65",clock11:"\uD83D\uDD5A",clock1130:"\uD83D\uDD66",clock12:"\uD83D\uDD5B",clock1230:"\uD83D\uDD67",clock130:"\uD83D\uDD5C",clock2:"\uD83D\uDD51",clock230:"\uD83D\uDD5D",clock3:"\uD83D\uDD52",clock330:"\uD83D\uDD5E",clock4:"\uD83D\uDD53",clock430:"\uD83D\uDD5F",clock5:"\uD83D\uDD54",clock530:"\uD83D\uDD60",clock6:"\uD83D\uDD55",clock630:"\uD83D\uDD61",clock7:"\uD83D\uDD56",clock730:"\uD83D\uDD62",clock8:"\uD83D\uDD57",clock830:"\uD83D\uDD63",clock9:"\uD83D\uDD58",clock930:"\uD83D\uDD64",closed_book:"\uD83D\uDCD5",closed_lock_with_key:"\uD83D\uDD10",closed_umbrella:"\uD83C\uDF02",cloud:"\u2601\uFE0F",cloud_with_lightning:"\uD83C\uDF29",cloud_with_lightning_and_rain:"\u26C8",cloud_with_rain:"\uD83C\uDF27",cloud_with_snow:"\uD83C\uDF28",clown_face:"\uD83E\uDD21",clubs:"\u2663\uFE0F",cocktail:"\uD83C\uDF78",coffee:"\u2615\uFE0F",coffin:"\u26B0\uFE0F",cold_sweat:"\uD83D\uDE30",comet:"\u2604\uFE0F",computer:"\uD83D\uDCBB",computer_mouse:"\uD83D\uDDB1",confetti_ball:"\uD83C\uDF8A",confounded:"\uD83D\uDE16",confused:"\uD83D\uDE15",congratulations:"\u3297\uFE0F",construction:"\uD83D\uDEA7",construction_worker_man:"\uD83D\uDC77",construction_worker_woman:"\uD83D\uDC77&zwj;\u2640\uFE0F",control_knobs:"\uD83C\uDF9B",convenience_store:"\uD83C\uDFEA",cookie:"\uD83C\uDF6A",cool:"\uD83C\uDD92",policeman:"\uD83D\uDC6E",copyright:"\xA9\uFE0F",corn:"\uD83C\uDF3D",couch_and_lamp:"\uD83D\uDECB",couple:"\uD83D\uDC6B",couple_with_heart_woman_man:"\uD83D\uDC91",couple_with_heart_man_man:"\uD83D\uDC68&zwj;\u2764\uFE0F&zwj;\uD83D\uDC68",couple_with_heart_woman_woman:"\uD83D\uDC69&zwj;\u2764\uFE0F&zwj;\uD83D\uDC69",couplekiss_man_man:"\uD83D\uDC68&zwj;\u2764\uFE0F&zwj;\uD83D\uDC8B&zwj;\uD83D\uDC68",couplekiss_man_woman:"\uD83D\uDC8F",couplekiss_woman_woman:"\uD83D\uDC69&zwj;\u2764\uFE0F&zwj;\uD83D\uDC8B&zwj;\uD83D\uDC69",cow:"\uD83D\uDC2E",cow2:"\uD83D\uDC04",cowboy_hat_face:"\uD83E\uDD20",crab:"\uD83E\uDD80",crayon:"\uD83D\uDD8D",credit_card:"\uD83D\uDCB3",crescent_moon:"\uD83C\uDF19",cricket:"\uD83C\uDFCF",crocodile:"\uD83D\uDC0A",croissant:"\uD83E\uDD50",crossed_fingers:"\uD83E\uDD1E",crossed_flags:"\uD83C\uDF8C",crossed_swords:"\u2694\uFE0F",crown:"\uD83D\uDC51",cry:"\uD83D\uDE22",crying_cat_face:"\uD83D\uDE3F",crystal_ball:"\uD83D\uDD2E",cucumber:"\uD83E\uDD52",cupid:"\uD83D\uDC98",curly_loop:"\u27B0",currency_exchange:"\uD83D\uDCB1",curry:"\uD83C\uDF5B",custard:"\uD83C\uDF6E",customs:"\uD83D\uDEC3",cyclone:"\uD83C\uDF00",dagger:"\uD83D\uDDE1",dancer:"\uD83D\uDC83",dancing_women:"\uD83D\uDC6F",dancing_men:"\uD83D\uDC6F&zwj;\u2642\uFE0F",dango:"\uD83C\uDF61",dark_sunglasses:"\uD83D\uDD76",dart:"\uD83C\uDFAF",dash:"\uD83D\uDCA8",date:"\uD83D\uDCC5",deciduous_tree:"\uD83C\uDF33",deer:"\uD83E\uDD8C",department_store:"\uD83C\uDFEC",derelict_house:"\uD83C\uDFDA",desert:"\uD83C\uDFDC",desert_island:"\uD83C\uDFDD",desktop_computer:"\uD83D\uDDA5",male_detective:"\uD83D\uDD75\uFE0F",diamond_shape_with_a_dot_inside:"\uD83D\uDCA0",diamonds:"\u2666\uFE0F",disappointed:"\uD83D\uDE1E",disappointed_relieved:"\uD83D\uDE25",dizzy:"\uD83D\uDCAB",dizzy_face:"\uD83D\uDE35",do_not_litter:"\uD83D\uDEAF",dog:"\uD83D\uDC36",dog2:"\uD83D\uDC15",dollar:"\uD83D\uDCB5",dolls:"\uD83C\uDF8E",dolphin:"\uD83D\uDC2C",door:"\uD83D\uDEAA",doughnut:"\uD83C\uDF69",dove:"\uD83D\uDD4A",dragon:"\uD83D\uDC09",dragon_face:"\uD83D\uDC32",dress:"\uD83D\uDC57",dromedary_camel:"\uD83D\uDC2A",drooling_face:"\uD83E\uDD24",droplet:"\uD83D\uDCA7",drum:"\uD83E\uDD41",duck:"\uD83E\uDD86",dvd:"\uD83D\uDCC0","e-mail":"\uD83D\uDCE7",eagle:"\uD83E\uDD85",ear:"\uD83D\uDC42",ear_of_rice:"\uD83C\uDF3E",earth_africa:"\uD83C\uDF0D",earth_americas:"\uD83C\uDF0E",earth_asia:"\uD83C\uDF0F",egg:"\uD83E\uDD5A",eggplant:"\uD83C\uDF46",eight_pointed_black_star:"\u2734\uFE0F",eight_spoked_asterisk:"\u2733\uFE0F",electric_plug:"\uD83D\uDD0C",elephant:"\uD83D\uDC18",email:"\u2709\uFE0F",end:"\uD83D\uDD1A",envelope_with_arrow:"\uD83D\uDCE9",euro:"\uD83D\uDCB6",european_castle:"\uD83C\uDFF0",european_post_office:"\uD83C\uDFE4",evergreen_tree:"\uD83C\uDF32",exclamation:"\u2757\uFE0F",expressionless:"\uD83D\uDE11",eye:"\uD83D\uDC41",eye_speech_bubble:"\uD83D\uDC41&zwj;\uD83D\uDDE8",eyeglasses:"\uD83D\uDC53",eyes:"\uD83D\uDC40",face_with_head_bandage:"\uD83E\uDD15",face_with_thermometer:"\uD83E\uDD12",fist_oncoming:"\uD83D\uDC4A",factory:"\uD83C\uDFED",fallen_leaf:"\uD83C\uDF42",family_man_woman_boy:"\uD83D\uDC6A",family_man_boy:"\uD83D\uDC68&zwj;\uD83D\uDC66",family_man_boy_boy:"\uD83D\uDC68&zwj;\uD83D\uDC66&zwj;\uD83D\uDC66",family_man_girl:"\uD83D\uDC68&zwj;\uD83D\uDC67",family_man_girl_boy:"\uD83D\uDC68&zwj;\uD83D\uDC67&zwj;\uD83D\uDC66",family_man_girl_girl:"\uD83D\uDC68&zwj;\uD83D\uDC67&zwj;\uD83D\uDC67",family_man_man_boy:"\uD83D\uDC68&zwj;\uD83D\uDC68&zwj;\uD83D\uDC66",family_man_man_boy_boy:"\uD83D\uDC68&zwj;\uD83D\uDC68&zwj;\uD83D\uDC66&zwj;\uD83D\uDC66",family_man_man_girl:"\uD83D\uDC68&zwj;\uD83D\uDC68&zwj;\uD83D\uDC67",family_man_man_girl_boy:"\uD83D\uDC68&zwj;\uD83D\uDC68&zwj;\uD83D\uDC67&zwj;\uD83D\uDC66",family_man_man_girl_girl:"\uD83D\uDC68&zwj;\uD83D\uDC68&zwj;\uD83D\uDC67&zwj;\uD83D\uDC67",family_man_woman_boy_boy:"\uD83D\uDC68&zwj;\uD83D\uDC69&zwj;\uD83D\uDC66&zwj;\uD83D\uDC66",family_man_woman_girl:"\uD83D\uDC68&zwj;\uD83D\uDC69&zwj;\uD83D\uDC67",family_man_woman_girl_boy:"\uD83D\uDC68&zwj;\uD83D\uDC69&zwj;\uD83D\uDC67&zwj;\uD83D\uDC66",family_man_woman_girl_girl:"\uD83D\uDC68&zwj;\uD83D\uDC69&zwj;\uD83D\uDC67&zwj;\uD83D\uDC67",family_woman_boy:"\uD83D\uDC69&zwj;\uD83D\uDC66",family_woman_boy_boy:"\uD83D\uDC69&zwj;\uD83D\uDC66&zwj;\uD83D\uDC66",family_woman_girl:"\uD83D\uDC69&zwj;\uD83D\uDC67",family_woman_girl_boy:"\uD83D\uDC69&zwj;\uD83D\uDC67&zwj;\uD83D\uDC66",family_woman_girl_girl:"\uD83D\uDC69&zwj;\uD83D\uDC67&zwj;\uD83D\uDC67",family_woman_woman_boy:"\uD83D\uDC69&zwj;\uD83D\uDC69&zwj;\uD83D\uDC66",family_woman_woman_boy_boy:"\uD83D\uDC69&zwj;\uD83D\uDC69&zwj;\uD83D\uDC66&zwj;\uD83D\uDC66",family_woman_woman_girl:"\uD83D\uDC69&zwj;\uD83D\uDC69&zwj;\uD83D\uDC67",family_woman_woman_girl_boy:"\uD83D\uDC69&zwj;\uD83D\uDC69&zwj;\uD83D\uDC67&zwj;\uD83D\uDC66",family_woman_woman_girl_girl:"\uD83D\uDC69&zwj;\uD83D\uDC69&zwj;\uD83D\uDC67&zwj;\uD83D\uDC67",fast_forward:"\u23E9",fax:"\uD83D\uDCE0",fearful:"\uD83D\uDE28",feet:"\uD83D\uDC3E",female_detective:"\uD83D\uDD75\uFE0F&zwj;\u2640\uFE0F",ferris_wheel:"\uD83C\uDFA1",ferry:"\u26F4",field_hockey:"\uD83C\uDFD1",file_cabinet:"\uD83D\uDDC4",file_folder:"\uD83D\uDCC1",film_projector:"\uD83D\uDCFD",film_strip:"\uD83C\uDF9E",fire:"\uD83D\uDD25",fire_engine:"\uD83D\uDE92",fireworks:"\uD83C\uDF86",first_quarter_moon:"\uD83C\uDF13",first_quarter_moon_with_face:"\uD83C\uDF1B",fish:"\uD83D\uDC1F",fish_cake:"\uD83C\uDF65",fishing_pole_and_fish:"\uD83C\uDFA3",fist_raised:"\u270A",fist_left:"\uD83E\uDD1B",fist_right:"\uD83E\uDD1C",flags:"\uD83C\uDF8F",flashlight:"\uD83D\uDD26",fleur_de_lis:"\u269C\uFE0F",flight_arrival:"\uD83D\uDEEC",flight_departure:"\uD83D\uDEEB",floppy_disk:"\uD83D\uDCBE",flower_playing_cards:"\uD83C\uDFB4",flushed:"\uD83D\uDE33",fog:"\uD83C\uDF2B",foggy:"\uD83C\uDF01",football:"\uD83C\uDFC8",footprints:"\uD83D\uDC63",fork_and_knife:"\uD83C\uDF74",fountain:"\u26F2\uFE0F",fountain_pen:"\uD83D\uDD8B",four_leaf_clover:"\uD83C\uDF40",fox_face:"\uD83E\uDD8A",framed_picture:"\uD83D\uDDBC",free:"\uD83C\uDD93",fried_egg:"\uD83C\uDF73",fried_shrimp:"\uD83C\uDF64",fries:"\uD83C\uDF5F",frog:"\uD83D\uDC38",frowning:"\uD83D\uDE26",frowning_face:"\u2639\uFE0F",frowning_man:"\uD83D\uDE4D&zwj;\u2642\uFE0F",frowning_woman:"\uD83D\uDE4D",middle_finger:"\uD83D\uDD95",fuelpump:"\u26FD\uFE0F",full_moon:"\uD83C\uDF15",full_moon_with_face:"\uD83C\uDF1D",funeral_urn:"\u26B1\uFE0F",game_die:"\uD83C\uDFB2",gear:"\u2699\uFE0F",gem:"\uD83D\uDC8E",gemini:"\u264A\uFE0F",ghost:"\uD83D\uDC7B",gift:"\uD83C\uDF81",gift_heart:"\uD83D\uDC9D",girl:"\uD83D\uDC67",globe_with_meridians:"\uD83C\uDF10",goal_net:"\uD83E\uDD45",goat:"\uD83D\uDC10",golf:"\u26F3\uFE0F",golfing_man:"\uD83C\uDFCC\uFE0F",golfing_woman:"\uD83C\uDFCC\uFE0F&zwj;\u2640\uFE0F",gorilla:"\uD83E\uDD8D",grapes:"\uD83C\uDF47",green_apple:"\uD83C\uDF4F",green_book:"\uD83D\uDCD7",green_heart:"\uD83D\uDC9A",green_salad:"\uD83E\uDD57",grey_exclamation:"\u2755",grey_question:"\u2754",grimacing:"\uD83D\uDE2C",grin:"\uD83D\uDE01",grinning:"\uD83D\uDE00",guardsman:"\uD83D\uDC82",guardswoman:"\uD83D\uDC82&zwj;\u2640\uFE0F",guitar:"\uD83C\uDFB8",gun:"\uD83D\uDD2B",haircut_woman:"\uD83D\uDC87",haircut_man:"\uD83D\uDC87&zwj;\u2642\uFE0F",hamburger:"\uD83C\uDF54",hammer:"\uD83D\uDD28",hammer_and_pick:"\u2692",hammer_and_wrench:"\uD83D\uDEE0",hamster:"\uD83D\uDC39",hand:"\u270B",handbag:"\uD83D\uDC5C",handshake:"\uD83E\uDD1D",hankey:"\uD83D\uDCA9",hatched_chick:"\uD83D\uDC25",hatching_chick:"\uD83D\uDC23",headphones:"\uD83C\uDFA7",hear_no_evil:"\uD83D\uDE49",heart:"\u2764\uFE0F",heart_decoration:"\uD83D\uDC9F",heart_eyes:"\uD83D\uDE0D",heart_eyes_cat:"\uD83D\uDE3B",heartbeat:"\uD83D\uDC93",heartpulse:"\uD83D\uDC97",hearts:"\u2665\uFE0F",heavy_check_mark:"\u2714\uFE0F",heavy_division_sign:"\u2797",heavy_dollar_sign:"\uD83D\uDCB2",heavy_heart_exclamation:"\u2763\uFE0F",heavy_minus_sign:"\u2796",heavy_multiplication_x:"\u2716\uFE0F",heavy_plus_sign:"\u2795",helicopter:"\uD83D\uDE81",herb:"\uD83C\uDF3F",hibiscus:"\uD83C\uDF3A",high_brightness:"\uD83D\uDD06",high_heel:"\uD83D\uDC60",hocho:"\uD83D\uDD2A",hole:"\uD83D\uDD73",honey_pot:"\uD83C\uDF6F",horse:"\uD83D\uDC34",horse_racing:"\uD83C\uDFC7",hospital:"\uD83C\uDFE5",hot_pepper:"\uD83C\uDF36",hotdog:"\uD83C\uDF2D",hotel:"\uD83C\uDFE8",hotsprings:"\u2668\uFE0F",hourglass:"\u231B\uFE0F",hourglass_flowing_sand:"\u23F3",house:"\uD83C\uDFE0",house_with_garden:"\uD83C\uDFE1",houses:"\uD83C\uDFD8",hugs:"\uD83E\uDD17",hushed:"\uD83D\uDE2F",ice_cream:"\uD83C\uDF68",ice_hockey:"\uD83C\uDFD2",ice_skate:"\u26F8",icecream:"\uD83C\uDF66",id:"\uD83C\uDD94",ideograph_advantage:"\uD83C\uDE50",imp:"\uD83D\uDC7F",inbox_tray:"\uD83D\uDCE5",incoming_envelope:"\uD83D\uDCE8",tipping_hand_woman:"\uD83D\uDC81",information_source:"\u2139\uFE0F",innocent:"\uD83D\uDE07",interrobang:"\u2049\uFE0F",iphone:"\uD83D\uDCF1",izakaya_lantern:"\uD83C\uDFEE",jack_o_lantern:"\uD83C\uDF83",japan:"\uD83D\uDDFE",japanese_castle:"\uD83C\uDFEF",japanese_goblin:"\uD83D\uDC7A",japanese_ogre:"\uD83D\uDC79",jeans:"\uD83D\uDC56",joy:"\uD83D\uDE02",joy_cat:"\uD83D\uDE39",joystick:"\uD83D\uDD79",kaaba:"\uD83D\uDD4B",key:"\uD83D\uDD11",keyboard:"\u2328\uFE0F",keycap_ten:"\uD83D\uDD1F",kick_scooter:"\uD83D\uDEF4",kimono:"\uD83D\uDC58",kiss:"\uD83D\uDC8B",kissing:"\uD83D\uDE17",kissing_cat:"\uD83D\uDE3D",kissing_closed_eyes:"\uD83D\uDE1A",kissing_heart:"\uD83D\uDE18",kissing_smiling_eyes:"\uD83D\uDE19",kiwi_fruit:"\uD83E\uDD5D",koala:"\uD83D\uDC28",koko:"\uD83C\uDE01",label:"\uD83C\uDFF7",large_blue_circle:"\uD83D\uDD35",large_blue_diamond:"\uD83D\uDD37",large_orange_diamond:"\uD83D\uDD36",last_quarter_moon:"\uD83C\uDF17",last_quarter_moon_with_face:"\uD83C\uDF1C",latin_cross:"\u271D\uFE0F",laughing:"\uD83D\uDE06",leaves:"\uD83C\uDF43",ledger:"\uD83D\uDCD2",left_luggage:"\uD83D\uDEC5",left_right_arrow:"\u2194\uFE0F",leftwards_arrow_with_hook:"\u21A9\uFE0F",lemon:"\uD83C\uDF4B",leo:"\u264C\uFE0F",leopard:"\uD83D\uDC06",level_slider:"\uD83C\uDF9A",libra:"\u264E\uFE0F",light_rail:"\uD83D\uDE88",link:"\uD83D\uDD17",lion:"\uD83E\uDD81",lips:"\uD83D\uDC44",lipstick:"\uD83D\uDC84",lizard:"\uD83E\uDD8E",lock:"\uD83D\uDD12",lock_with_ink_pen:"\uD83D\uDD0F",lollipop:"\uD83C\uDF6D",loop:"\u27BF",loud_sound:"\uD83D\uDD0A",loudspeaker:"\uD83D\uDCE2",love_hotel:"\uD83C\uDFE9",love_letter:"\uD83D\uDC8C",low_brightness:"\uD83D\uDD05",lying_face:"\uD83E\uDD25",m:"\u24C2\uFE0F",mag:"\uD83D\uDD0D",mag_right:"\uD83D\uDD0E",mahjong:"\uD83C\uDC04\uFE0F",mailbox:"\uD83D\uDCEB",mailbox_closed:"\uD83D\uDCEA",mailbox_with_mail:"\uD83D\uDCEC",mailbox_with_no_mail:"\uD83D\uDCED",man:"\uD83D\uDC68",man_artist:"\uD83D\uDC68&zwj;\uD83C\uDFA8",man_astronaut:"\uD83D\uDC68&zwj;\uD83D\uDE80",man_cartwheeling:"\uD83E\uDD38&zwj;\u2642\uFE0F",man_cook:"\uD83D\uDC68&zwj;\uD83C\uDF73",man_dancing:"\uD83D\uDD7A",man_facepalming:"\uD83E\uDD26&zwj;\u2642\uFE0F",man_factory_worker:"\uD83D\uDC68&zwj;\uD83C\uDFED",man_farmer:"\uD83D\uDC68&zwj;\uD83C\uDF3E",man_firefighter:"\uD83D\uDC68&zwj;\uD83D\uDE92",man_health_worker:"\uD83D\uDC68&zwj;\u2695\uFE0F",man_in_tuxedo:"\uD83E\uDD35",man_judge:"\uD83D\uDC68&zwj;\u2696\uFE0F",man_juggling:"\uD83E\uDD39&zwj;\u2642\uFE0F",man_mechanic:"\uD83D\uDC68&zwj;\uD83D\uDD27",man_office_worker:"\uD83D\uDC68&zwj;\uD83D\uDCBC",man_pilot:"\uD83D\uDC68&zwj;\u2708\uFE0F",man_playing_handball:"\uD83E\uDD3E&zwj;\u2642\uFE0F",man_playing_water_polo:"\uD83E\uDD3D&zwj;\u2642\uFE0F",man_scientist:"\uD83D\uDC68&zwj;\uD83D\uDD2C",man_shrugging:"\uD83E\uDD37&zwj;\u2642\uFE0F",man_singer:"\uD83D\uDC68&zwj;\uD83C\uDFA4",man_student:"\uD83D\uDC68&zwj;\uD83C\uDF93",man_teacher:"\uD83D\uDC68&zwj;\uD83C\uDFEB",man_technologist:"\uD83D\uDC68&zwj;\uD83D\uDCBB",man_with_gua_pi_mao:"\uD83D\uDC72",man_with_turban:"\uD83D\uDC73",tangerine:"\uD83C\uDF4A",mans_shoe:"\uD83D\uDC5E",mantelpiece_clock:"\uD83D\uDD70",maple_leaf:"\uD83C\uDF41",martial_arts_uniform:"\uD83E\uDD4B",mask:"\uD83D\uDE37",massage_woman:"\uD83D\uDC86",massage_man:"\uD83D\uDC86&zwj;\u2642\uFE0F",meat_on_bone:"\uD83C\uDF56",medal_military:"\uD83C\uDF96",medal_sports:"\uD83C\uDFC5",mega:"\uD83D\uDCE3",melon:"\uD83C\uDF48",memo:"\uD83D\uDCDD",men_wrestling:"\uD83E\uDD3C&zwj;\u2642\uFE0F",menorah:"\uD83D\uDD4E",mens:"\uD83D\uDEB9",metal:"\uD83E\uDD18",metro:"\uD83D\uDE87",microphone:"\uD83C\uDFA4",microscope:"\uD83D\uDD2C",milk_glass:"\uD83E\uDD5B",milky_way:"\uD83C\uDF0C",minibus:"\uD83D\uDE90",minidisc:"\uD83D\uDCBD",mobile_phone_off:"\uD83D\uDCF4",money_mouth_face:"\uD83E\uDD11",money_with_wings:"\uD83D\uDCB8",moneybag:"\uD83D\uDCB0",monkey:"\uD83D\uDC12",monkey_face:"\uD83D\uDC35",monorail:"\uD83D\uDE9D",moon:"\uD83C\uDF14",mortar_board:"\uD83C\uDF93",mosque:"\uD83D\uDD4C",motor_boat:"\uD83D\uDEE5",motor_scooter:"\uD83D\uDEF5",motorcycle:"\uD83C\uDFCD",motorway:"\uD83D\uDEE3",mount_fuji:"\uD83D\uDDFB",mountain:"\u26F0",mountain_biking_man:"\uD83D\uDEB5",mountain_biking_woman:"\uD83D\uDEB5&zwj;\u2640\uFE0F",mountain_cableway:"\uD83D\uDEA0",mountain_railway:"\uD83D\uDE9E",mountain_snow:"\uD83C\uDFD4",mouse:"\uD83D\uDC2D",mouse2:"\uD83D\uDC01",movie_camera:"\uD83C\uDFA5",moyai:"\uD83D\uDDFF",mrs_claus:"\uD83E\uDD36",muscle:"\uD83D\uDCAA",mushroom:"\uD83C\uDF44",musical_keyboard:"\uD83C\uDFB9",musical_note:"\uD83C\uDFB5",musical_score:"\uD83C\uDFBC",mute:"\uD83D\uDD07",nail_care:"\uD83D\uDC85",name_badge:"\uD83D\uDCDB",national_park:"\uD83C\uDFDE",nauseated_face:"\uD83E\uDD22",necktie:"\uD83D\uDC54",negative_squared_cross_mark:"\u274E",nerd_face:"\uD83E\uDD13",neutral_face:"\uD83D\uDE10",new:"\uD83C\uDD95",new_moon:"\uD83C\uDF11",new_moon_with_face:"\uD83C\uDF1A",newspaper:"\uD83D\uDCF0",newspaper_roll:"\uD83D\uDDDE",next_track_button:"\u23ED",ng:"\uD83C\uDD96",no_good_man:"\uD83D\uDE45&zwj;\u2642\uFE0F",no_good_woman:"\uD83D\uDE45",night_with_stars:"\uD83C\uDF03",no_bell:"\uD83D\uDD15",no_bicycles:"\uD83D\uDEB3",no_entry:"\u26D4\uFE0F",no_entry_sign:"\uD83D\uDEAB",no_mobile_phones:"\uD83D\uDCF5",no_mouth:"\uD83D\uDE36",no_pedestrians:"\uD83D\uDEB7",no_smoking:"\uD83D\uDEAD","non-potable_water":"\uD83D\uDEB1",nose:"\uD83D\uDC43",notebook:"\uD83D\uDCD3",notebook_with_decorative_cover:"\uD83D\uDCD4",notes:"\uD83C\uDFB6",nut_and_bolt:"\uD83D\uDD29",o:"\u2B55\uFE0F",o2:"\uD83C\uDD7E\uFE0F",ocean:"\uD83C\uDF0A",octopus:"\uD83D\uDC19",oden:"\uD83C\uDF62",office:"\uD83C\uDFE2",oil_drum:"\uD83D\uDEE2",ok:"\uD83C\uDD97",ok_hand:"\uD83D\uDC4C",ok_man:"\uD83D\uDE46&zwj;\u2642\uFE0F",ok_woman:"\uD83D\uDE46",old_key:"\uD83D\uDDDD",older_man:"\uD83D\uDC74",older_woman:"\uD83D\uDC75",om:"\uD83D\uDD49",on:"\uD83D\uDD1B",oncoming_automobile:"\uD83D\uDE98",oncoming_bus:"\uD83D\uDE8D",oncoming_police_car:"\uD83D\uDE94",oncoming_taxi:"\uD83D\uDE96",open_file_folder:"\uD83D\uDCC2",open_hands:"\uD83D\uDC50",open_mouth:"\uD83D\uDE2E",open_umbrella:"\u2602\uFE0F",ophiuchus:"\u26CE",orange_book:"\uD83D\uDCD9",orthodox_cross:"\u2626\uFE0F",outbox_tray:"\uD83D\uDCE4",owl:"\uD83E\uDD89",ox:"\uD83D\uDC02",package:"\uD83D\uDCE6",page_facing_up:"\uD83D\uDCC4",page_with_curl:"\uD83D\uDCC3",pager:"\uD83D\uDCDF",paintbrush:"\uD83D\uDD8C",palm_tree:"\uD83C\uDF34",pancakes:"\uD83E\uDD5E",panda_face:"\uD83D\uDC3C",paperclip:"\uD83D\uDCCE",paperclips:"\uD83D\uDD87",parasol_on_ground:"\u26F1",parking:"\uD83C\uDD7F\uFE0F",part_alternation_mark:"\u303D\uFE0F",partly_sunny:"\u26C5\uFE0F",passenger_ship:"\uD83D\uDEF3",passport_control:"\uD83D\uDEC2",pause_button:"\u23F8",peace_symbol:"\u262E\uFE0F",peach:"\uD83C\uDF51",peanuts:"\uD83E\uDD5C",pear:"\uD83C\uDF50",pen:"\uD83D\uDD8A",pencil2:"\u270F\uFE0F",penguin:"\uD83D\uDC27",pensive:"\uD83D\uDE14",performing_arts:"\uD83C\uDFAD",persevere:"\uD83D\uDE23",person_fencing:"\uD83E\uDD3A",pouting_woman:"\uD83D\uDE4E",phone:"\u260E\uFE0F",pick:"\u26CF",pig:"\uD83D\uDC37",pig2:"\uD83D\uDC16",pig_nose:"\uD83D\uDC3D",pill:"\uD83D\uDC8A",pineapple:"\uD83C\uDF4D",ping_pong:"\uD83C\uDFD3",pisces:"\u2653\uFE0F",pizza:"\uD83C\uDF55",place_of_worship:"\uD83D\uDED0",plate_with_cutlery:"\uD83C\uDF7D",play_or_pause_button:"\u23EF",point_down:"\uD83D\uDC47",point_left:"\uD83D\uDC48",point_right:"\uD83D\uDC49",point_up:"\u261D\uFE0F",point_up_2:"\uD83D\uDC46",police_car:"\uD83D\uDE93",policewoman:"\uD83D\uDC6E&zwj;\u2640\uFE0F",poodle:"\uD83D\uDC29",popcorn:"\uD83C\uDF7F",post_office:"\uD83C\uDFE3",postal_horn:"\uD83D\uDCEF",postbox:"\uD83D\uDCEE",potable_water:"\uD83D\uDEB0",potato:"\uD83E\uDD54",pouch:"\uD83D\uDC5D",poultry_leg:"\uD83C\uDF57",pound:"\uD83D\uDCB7",rage:"\uD83D\uDE21",pouting_cat:"\uD83D\uDE3E",pouting_man:"\uD83D\uDE4E&zwj;\u2642\uFE0F",pray:"\uD83D\uDE4F",prayer_beads:"\uD83D\uDCFF",pregnant_woman:"\uD83E\uDD30",previous_track_button:"\u23EE",prince:"\uD83E\uDD34",princess:"\uD83D\uDC78",printer:"\uD83D\uDDA8",purple_heart:"\uD83D\uDC9C",purse:"\uD83D\uDC5B",pushpin:"\uD83D\uDCCC",put_litter_in_its_place:"\uD83D\uDEAE",question:"\u2753",rabbit:"\uD83D\uDC30",rabbit2:"\uD83D\uDC07",racehorse:"\uD83D\uDC0E",racing_car:"\uD83C\uDFCE",radio:"\uD83D\uDCFB",radio_button:"\uD83D\uDD18",radioactive:"\u2622\uFE0F",railway_car:"\uD83D\uDE83",railway_track:"\uD83D\uDEE4",rainbow:"\uD83C\uDF08",rainbow_flag:"\uD83C\uDFF3\uFE0F&zwj;\uD83C\uDF08",raised_back_of_hand:"\uD83E\uDD1A",raised_hand_with_fingers_splayed:"\uD83D\uDD90",raised_hands:"\uD83D\uDE4C",raising_hand_woman:"\uD83D\uDE4B",raising_hand_man:"\uD83D\uDE4B&zwj;\u2642\uFE0F",ram:"\uD83D\uDC0F",ramen:"\uD83C\uDF5C",rat:"\uD83D\uDC00",record_button:"\u23FA",recycle:"\u267B\uFE0F",red_circle:"\uD83D\uDD34",registered:"\xAE\uFE0F",relaxed:"\u263A\uFE0F",relieved:"\uD83D\uDE0C",reminder_ribbon:"\uD83C\uDF97",repeat:"\uD83D\uDD01",repeat_one:"\uD83D\uDD02",rescue_worker_helmet:"\u26D1",restroom:"\uD83D\uDEBB",revolving_hearts:"\uD83D\uDC9E",rewind:"\u23EA",rhinoceros:"\uD83E\uDD8F",ribbon:"\uD83C\uDF80",rice:"\uD83C\uDF5A",rice_ball:"\uD83C\uDF59",rice_cracker:"\uD83C\uDF58",rice_scene:"\uD83C\uDF91",right_anger_bubble:"\uD83D\uDDEF",ring:"\uD83D\uDC8D",robot:"\uD83E\uDD16",rocket:"\uD83D\uDE80",rofl:"\uD83E\uDD23",roll_eyes:"\uD83D\uDE44",roller_coaster:"\uD83C\uDFA2",rooster:"\uD83D\uDC13",rose:"\uD83C\uDF39",rosette:"\uD83C\uDFF5",rotating_light:"\uD83D\uDEA8",round_pushpin:"\uD83D\uDCCD",rowing_man:"\uD83D\uDEA3",rowing_woman:"\uD83D\uDEA3&zwj;\u2640\uFE0F",rugby_football:"\uD83C\uDFC9",running_man:"\uD83C\uDFC3",running_shirt_with_sash:"\uD83C\uDFBD",running_woman:"\uD83C\uDFC3&zwj;\u2640\uFE0F",sa:"\uD83C\uDE02\uFE0F",sagittarius:"\u2650\uFE0F",sake:"\uD83C\uDF76",sandal:"\uD83D\uDC61",santa:"\uD83C\uDF85",satellite:"\uD83D\uDCE1",saxophone:"\uD83C\uDFB7",school:"\uD83C\uDFEB",school_satchel:"\uD83C\uDF92",scissors:"\u2702\uFE0F",scorpion:"\uD83E\uDD82",scorpius:"\u264F\uFE0F",scream:"\uD83D\uDE31",scream_cat:"\uD83D\uDE40",scroll:"\uD83D\uDCDC",seat:"\uD83D\uDCBA",secret:"\u3299\uFE0F",see_no_evil:"\uD83D\uDE48",seedling:"\uD83C\uDF31",selfie:"\uD83E\uDD33",shallow_pan_of_food:"\uD83E\uDD58",shamrock:"\u2618\uFE0F",shark:"\uD83E\uDD88",shaved_ice:"\uD83C\uDF67",sheep:"\uD83D\uDC11",shell:"\uD83D\uDC1A",shield:"\uD83D\uDEE1",shinto_shrine:"\u26E9",ship:"\uD83D\uDEA2",shirt:"\uD83D\uDC55",shopping:"\uD83D\uDECD",shopping_cart:"\uD83D\uDED2",shower:"\uD83D\uDEBF",shrimp:"\uD83E\uDD90",signal_strength:"\uD83D\uDCF6",six_pointed_star:"\uD83D\uDD2F",ski:"\uD83C\uDFBF",skier:"\u26F7",skull:"\uD83D\uDC80",skull_and_crossbones:"\u2620\uFE0F",sleeping:"\uD83D\uDE34",sleeping_bed:"\uD83D\uDECC",sleepy:"\uD83D\uDE2A",slightly_frowning_face:"\uD83D\uDE41",slightly_smiling_face:"\uD83D\uDE42",slot_machine:"\uD83C\uDFB0",small_airplane:"\uD83D\uDEE9",small_blue_diamond:"\uD83D\uDD39",small_orange_diamond:"\uD83D\uDD38",small_red_triangle:"\uD83D\uDD3A",small_red_triangle_down:"\uD83D\uDD3B",smile:"\uD83D\uDE04",smile_cat:"\uD83D\uDE38",smiley:"\uD83D\uDE03",smiley_cat:"\uD83D\uDE3A",smiling_imp:"\uD83D\uDE08",smirk:"\uD83D\uDE0F",smirk_cat:"\uD83D\uDE3C",smoking:"\uD83D\uDEAC",snail:"\uD83D\uDC0C",snake:"\uD83D\uDC0D",sneezing_face:"\uD83E\uDD27",snowboarder:"\uD83C\uDFC2",snowflake:"\u2744\uFE0F",snowman:"\u26C4\uFE0F",snowman_with_snow:"\u2603\uFE0F",sob:"\uD83D\uDE2D",soccer:"\u26BD\uFE0F",soon:"\uD83D\uDD1C",sos:"\uD83C\uDD98",sound:"\uD83D\uDD09",space_invader:"\uD83D\uDC7E",spades:"\u2660\uFE0F",spaghetti:"\uD83C\uDF5D",sparkle:"\u2747\uFE0F",sparkler:"\uD83C\uDF87",sparkles:"\u2728",sparkling_heart:"\uD83D\uDC96",speak_no_evil:"\uD83D\uDE4A",speaker:"\uD83D\uDD08",speaking_head:"\uD83D\uDDE3",speech_balloon:"\uD83D\uDCAC",speedboat:"\uD83D\uDEA4",spider:"\uD83D\uDD77",spider_web:"\uD83D\uDD78",spiral_calendar:"\uD83D\uDDD3",spiral_notepad:"\uD83D\uDDD2",spoon:"\uD83E\uDD44",squid:"\uD83E\uDD91",stadium:"\uD83C\uDFDF",star:"\u2B50\uFE0F",star2:"\uD83C\uDF1F",star_and_crescent:"\u262A\uFE0F",star_of_david:"\u2721\uFE0F",stars:"\uD83C\uDF20",station:"\uD83D\uDE89",statue_of_liberty:"\uD83D\uDDFD",steam_locomotive:"\uD83D\uDE82",stew:"\uD83C\uDF72",stop_button:"\u23F9",stop_sign:"\uD83D\uDED1",stopwatch:"\u23F1",straight_ruler:"\uD83D\uDCCF",strawberry:"\uD83C\uDF53",stuck_out_tongue:"\uD83D\uDE1B",stuck_out_tongue_closed_eyes:"\uD83D\uDE1D",stuck_out_tongue_winking_eye:"\uD83D\uDE1C",studio_microphone:"\uD83C\uDF99",stuffed_flatbread:"\uD83E\uDD59",sun_behind_large_cloud:"\uD83C\uDF25",sun_behind_rain_cloud:"\uD83C\uDF26",sun_behind_small_cloud:"\uD83C\uDF24",sun_with_face:"\uD83C\uDF1E",sunflower:"\uD83C\uDF3B",sunglasses:"\uD83D\uDE0E",sunny:"\u2600\uFE0F",sunrise:"\uD83C\uDF05",sunrise_over_mountains:"\uD83C\uDF04",surfing_man:"\uD83C\uDFC4",surfing_woman:"\uD83C\uDFC4&zwj;\u2640\uFE0F",sushi:"\uD83C\uDF63",suspension_railway:"\uD83D\uDE9F",sweat:"\uD83D\uDE13",sweat_drops:"\uD83D\uDCA6",sweat_smile:"\uD83D\uDE05",sweet_potato:"\uD83C\uDF60",swimming_man:"\uD83C\uDFCA",swimming_woman:"\uD83C\uDFCA&zwj;\u2640\uFE0F",symbols:"\uD83D\uDD23",synagogue:"\uD83D\uDD4D",syringe:"\uD83D\uDC89",taco:"\uD83C\uDF2E",tada:"\uD83C\uDF89",tanabata_tree:"\uD83C\uDF8B",taurus:"\u2649\uFE0F",taxi:"\uD83D\uDE95",tea:"\uD83C\uDF75",telephone_receiver:"\uD83D\uDCDE",telescope:"\uD83D\uDD2D",tennis:"\uD83C\uDFBE",tent:"\u26FA\uFE0F",thermometer:"\uD83C\uDF21",thinking:"\uD83E\uDD14",thought_balloon:"\uD83D\uDCAD",ticket:"\uD83C\uDFAB",tickets:"\uD83C\uDF9F",tiger:"\uD83D\uDC2F",tiger2:"\uD83D\uDC05",timer_clock:"\u23F2",tipping_hand_man:"\uD83D\uDC81&zwj;\u2642\uFE0F",tired_face:"\uD83D\uDE2B",tm:"\u2122\uFE0F",toilet:"\uD83D\uDEBD",tokyo_tower:"\uD83D\uDDFC",tomato:"\uD83C\uDF45",tongue:"\uD83D\uDC45",top:"\uD83D\uDD1D",tophat:"\uD83C\uDFA9",tornado:"\uD83C\uDF2A",trackball:"\uD83D\uDDB2",tractor:"\uD83D\uDE9C",traffic_light:"\uD83D\uDEA5",train:"\uD83D\uDE8B",train2:"\uD83D\uDE86",tram:"\uD83D\uDE8A",triangular_flag_on_post:"\uD83D\uDEA9",triangular_ruler:"\uD83D\uDCD0",trident:"\uD83D\uDD31",triumph:"\uD83D\uDE24",trolleybus:"\uD83D\uDE8E",trophy:"\uD83C\uDFC6",tropical_drink:"\uD83C\uDF79",tropical_fish:"\uD83D\uDC20",truck:"\uD83D\uDE9A",trumpet:"\uD83C\uDFBA",tulip:"\uD83C\uDF37",tumbler_glass:"\uD83E\uDD43",turkey:"\uD83E\uDD83",turtle:"\uD83D\uDC22",tv:"\uD83D\uDCFA",twisted_rightwards_arrows:"\uD83D\uDD00",two_hearts:"\uD83D\uDC95",two_men_holding_hands:"\uD83D\uDC6C",two_women_holding_hands:"\uD83D\uDC6D",u5272:"\uD83C\uDE39",u5408:"\uD83C\uDE34",u55b6:"\uD83C\uDE3A",u6307:"\uD83C\uDE2F\uFE0F",u6708:"\uD83C\uDE37\uFE0F",u6709:"\uD83C\uDE36",u6e80:"\uD83C\uDE35",u7121:"\uD83C\uDE1A\uFE0F",u7533:"\uD83C\uDE38",u7981:"\uD83C\uDE32",u7a7a:"\uD83C\uDE33",umbrella:"\u2614\uFE0F",unamused:"\uD83D\uDE12",underage:"\uD83D\uDD1E",unicorn:"\uD83E\uDD84",unlock:"\uD83D\uDD13",up:"\uD83C\uDD99",upside_down_face:"\uD83D\uDE43",v:"\u270C\uFE0F",vertical_traffic_light:"\uD83D\uDEA6",vhs:"\uD83D\uDCFC",vibration_mode:"\uD83D\uDCF3",video_camera:"\uD83D\uDCF9",video_game:"\uD83C\uDFAE",violin:"\uD83C\uDFBB",virgo:"\u264D\uFE0F",volcano:"\uD83C\uDF0B",volleyball:"\uD83C\uDFD0",vs:"\uD83C\uDD9A",vulcan_salute:"\uD83D\uDD96",walking_man:"\uD83D\uDEB6",walking_woman:"\uD83D\uDEB6&zwj;\u2640\uFE0F",waning_crescent_moon:"\uD83C\uDF18",waning_gibbous_moon:"\uD83C\uDF16",warning:"\u26A0\uFE0F",wastebasket:"\uD83D\uDDD1",watch:"\u231A\uFE0F",water_buffalo:"\uD83D\uDC03",watermelon:"\uD83C\uDF49",wave:"\uD83D\uDC4B",wavy_dash:"\u3030\uFE0F",waxing_crescent_moon:"\uD83C\uDF12",wc:"\uD83D\uDEBE",weary:"\uD83D\uDE29",wedding:"\uD83D\uDC92",weight_lifting_man:"\uD83C\uDFCB\uFE0F",weight_lifting_woman:"\uD83C\uDFCB\uFE0F&zwj;\u2640\uFE0F",whale:"\uD83D\uDC33",whale2:"\uD83D\uDC0B",wheel_of_dharma:"\u2638\uFE0F",wheelchair:"\u267F\uFE0F",white_check_mark:"\u2705",white_circle:"\u26AA\uFE0F",white_flag:"\uD83C\uDFF3\uFE0F",white_flower:"\uD83D\uDCAE",white_large_square:"\u2B1C\uFE0F",white_medium_small_square:"\u25FD\uFE0F",white_medium_square:"\u25FB\uFE0F",white_small_square:"\u25AB\uFE0F",white_square_button:"\uD83D\uDD33",wilted_flower:"\uD83E\uDD40",wind_chime:"\uD83C\uDF90",wind_face:"\uD83C\uDF2C",wine_glass:"\uD83C\uDF77",wink:"\uD83D\uDE09",wolf:"\uD83D\uDC3A",woman:"\uD83D\uDC69",woman_artist:"\uD83D\uDC69&zwj;\uD83C\uDFA8",woman_astronaut:"\uD83D\uDC69&zwj;\uD83D\uDE80",woman_cartwheeling:"\uD83E\uDD38&zwj;\u2640\uFE0F",woman_cook:"\uD83D\uDC69&zwj;\uD83C\uDF73",woman_facepalming:"\uD83E\uDD26&zwj;\u2640\uFE0F",woman_factory_worker:"\uD83D\uDC69&zwj;\uD83C\uDFED",woman_farmer:"\uD83D\uDC69&zwj;\uD83C\uDF3E",woman_firefighter:"\uD83D\uDC69&zwj;\uD83D\uDE92",woman_health_worker:"\uD83D\uDC69&zwj;\u2695\uFE0F",woman_judge:"\uD83D\uDC69&zwj;\u2696\uFE0F",woman_juggling:"\uD83E\uDD39&zwj;\u2640\uFE0F",woman_mechanic:"\uD83D\uDC69&zwj;\uD83D\uDD27",woman_office_worker:"\uD83D\uDC69&zwj;\uD83D\uDCBC",woman_pilot:"\uD83D\uDC69&zwj;\u2708\uFE0F",woman_playing_handball:"\uD83E\uDD3E&zwj;\u2640\uFE0F",woman_playing_water_polo:"\uD83E\uDD3D&zwj;\u2640\uFE0F",woman_scientist:"\uD83D\uDC69&zwj;\uD83D\uDD2C",woman_shrugging:"\uD83E\uDD37&zwj;\u2640\uFE0F",woman_singer:"\uD83D\uDC69&zwj;\uD83C\uDFA4",woman_student:"\uD83D\uDC69&zwj;\uD83C\uDF93",woman_teacher:"\uD83D\uDC69&zwj;\uD83C\uDFEB",woman_technologist:"\uD83D\uDC69&zwj;\uD83D\uDCBB",woman_with_turban:"\uD83D\uDC73&zwj;\u2640\uFE0F",womans_clothes:"\uD83D\uDC5A",womans_hat:"\uD83D\uDC52",women_wrestling:"\uD83E\uDD3C&zwj;\u2640\uFE0F",womens:"\uD83D\uDEBA",world_map:"\uD83D\uDDFA",worried:"\uD83D\uDE1F",wrench:"\uD83D\uDD27",writing_hand:"\u270D\uFE0F",x:"\u274C",yellow_heart:"\uD83D\uDC9B",yen:"\uD83D\uDCB4",yin_yang:"\u262F\uFE0F",yum:"\uD83D\uDE0B",zap:"\u26A1\uFE0F",zipper_mouth_face:"\uD83E\uDD10",zzz:"\uD83D\uDCA4",/* special emojis :P */octocat:"<img width=\"20\" height=\"20\" align=\"absmiddle\" src=\"https://assets-cdn.github.com/images/icons/emoji/octocat.png\">",showdown:"<img width=\"20\" height=\"20\" align=\"absmiddle\" src=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAAAS1BMVEX///8jJS0jJS0jJS0jJS0jJS0jJS0jJS0jJS0jJS0jJS0jJS0jJS0jJS0jJS0jJS0jJS3b1q3b1q3b1q3b1q3b1q3b1q3b1q3b1q0565CIAAAAGXRSTlMAQHCAYCCw/+DQwPCQUBAwoHCAEP+wwFBgS2fvBgAAAUZJREFUeAHs1cGy7BAUheFFsEDw/k97VTq3T6ge2EmdM+pvrP6Iwd74XV9Kb52xuMU4/uc1YNgZLFOeV8FGdhGrNk5SEgUyPxAEdj4LlMRDyhVAMVEa2M7TBSeVZAFPdqHgzSZJwPKgcLFLAooHDJo4EDCw4gAtBoJA5UFj4Ng5LOGLwVXZuoIlji/jeQHFk7+baHxrCjeUwB9+s88KndvlhcyBN5BSkYNQIVVb4pV+Npm7hhuKDs/uMP5KxT3WzSNNLIuuoDpMmuAVMruMSeDyQBi24DTr43LAY7ILA1QYaWkgfHzFthYYzg67SQsCbB8GhJUEGCtO9n0rSaCLxgJQjS/JSgMTg2eBDEHAJ+H350AsjYNYscrErgI2e/l+mdR967TCX/v6N0EhPECYCP0i+IAoYQOE8BogNhQMEMdrgAQWHaMAAGi5I5euoY9NAAAAAElFTkSuQmCC\">"};/**
    * These are all the transformations that form block-level
    * tags like paragraphs, headers, and list items.
    */showdown.subParser("makehtml.blockGamut",function(text,options,globals){'use strict';text=globals.converter._dispatch("makehtml.blockGamut.before",text,options,globals).getText();// we parse blockquotes first so that we can have headings and hrs
// inside blockquotes
text=showdown.subParser("makehtml.blockQuotes")(text,options,globals);text=showdown.subParser("makehtml.headers")(text,options,globals);// Do Horizontal Rules:
text=showdown.subParser("makehtml.horizontalRule")(text,options,globals);text=showdown.subParser("makehtml.lists")(text,options,globals);text=showdown.subParser("makehtml.codeBlocks")(text,options,globals);text=showdown.subParser("makehtml.tables")(text,options,globals);// We already ran _HashHTMLBlocks() before, in Markdown(), but that
// was to escape raw HTML in the original Markdown source. This time,
// we're escaping the markup we've just created, so that we don't wrap
// <p> tags around block-level tags.
text=showdown.subParser("makehtml.hashHTMLBlocks")(text,options,globals);text=showdown.subParser("makehtml.paragraphs")(text,options,globals);text=globals.converter._dispatch("makehtml.blockGamut.after",text,options,globals).getText();return text});showdown.subParser("makehtml.blockQuotes",function(text,options,globals){'use strict';text=globals.converter._dispatch("makehtml.blockQuotes.before",text,options,globals).getText();// add a couple extra lines after the text and endtext mark
text=text+"\n\n";var rgx=/(^ {0,3}>[ \t]?.+\n(.+\n)*\n*)+/gm;if(options.splitAdjacentBlockquotes){rgx=/^ {0,3}>[\s\S]*?(?:\n\n)/gm}text=text.replace(rgx,function(bq){// attacklab: hack around Konqueror 3.5.4 bug:
// "----------bug".replace(/^-/g,"") == "bug"
bq=bq.replace(/^[ \t]*>[ \t]?/gm,"");// trim one level of quoting
// attacklab: clean up hack
bq=bq.replace(/¨0/g,"");bq=bq.replace(/^[ \t]+$/gm,"");// trim whitespace-only lines
bq=showdown.subParser("makehtml.githubCodeBlocks")(bq,options,globals);bq=showdown.subParser("makehtml.blockGamut")(bq,options,globals);// recurse
bq=bq.replace(/(^|\n)/g,"$1  ");// These leading spaces screw with <pre> content, so we need to fix that:
bq=bq.replace(/(\s*<pre>[^\r]+?<\/pre>)/gm,function(wholeMatch,m1){var pre=m1;// attacklab: hack around Konqueror 3.5.4 bug:
pre=pre.replace(/^  /mg,"\xA80");pre=pre.replace(/¨0/g,"");return pre});return showdown.subParser("makehtml.hashBlock")("<blockquote>\n"+bq+"\n</blockquote>",options,globals)});text=globals.converter._dispatch("makehtml.blockQuotes.after",text,options,globals).getText();return text});/**
     * Process Markdown `<pre><code>` blocks.
     */showdown.subParser("makehtml.codeBlocks",function(text,options,globals){'use strict';text=globals.converter._dispatch("makehtml.codeBlocks.before",text,options,globals).getText();// sentinel workarounds for lack of \A and \Z, safari\khtml bug
text+="\xA80";var pattern=/(?:\n\n|^)((?:(?:[ ]{4}|\t).*\n+)+)(\n*[ ]{0,3}[^ \t\n]|(?=¨0))/g;text=text.replace(pattern,function(wholeMatch,m1,m2){var codeblock=m1,nextChar=m2,end="\n";codeblock=showdown.subParser("makehtml.outdent")(codeblock,options,globals);codeblock=showdown.subParser("makehtml.encodeCode")(codeblock,options,globals);codeblock=showdown.subParser("makehtml.detab")(codeblock,options,globals);codeblock=codeblock.replace(/^\n+/g,"");// trim leading newlines
codeblock=codeblock.replace(/\n+$/g,"");// trim trailing newlines
if(options.omitExtraWLInCodeBlocks){end=""}codeblock="<pre><code>"+codeblock+end+"</code></pre>";return showdown.subParser("makehtml.hashBlock")(codeblock,options,globals)+nextChar});// strip sentinel
text=text.replace(/¨0/,"");text=globals.converter._dispatch("makehtml.codeBlocks.after",text,options,globals).getText();return text});/**
     *
     *   *  Backtick quotes are used for <code></code> spans.
     *
     *   *  You can use multiple backticks as the delimiters if you want to
     *     include literal backticks in the code span. So, this input:
     *
     *         Just type ``foo `bar` baz`` at the prompt.
     *
     *       Will translate to:
     *
     *         <p>Just type <code>foo `bar` baz</code> at the prompt.</p>
     *
     *    There's no arbitrary limit to the number of backticks you
     *    can use as delimters. If you need three consecutive backticks
     *    in your code, use four for delimiters, etc.
     *
     *  *  You can use spaces to get literal backticks at the edges:
     *
     *         ... type `` `bar` `` ...
     *
     *       Turns to:
     *
     *         ... type <code>`bar`</code> ...
     */showdown.subParser("makehtml.codeSpans",function(text,options,globals){'use strict';text=globals.converter._dispatch("makehtml.codeSpans.before",text,options,globals).getText();if("undefined"===typeof text){text=""}text=text.replace(/(^|[^\\])(`+)([^\r]*?[^`])\2(?!`)/gm,function(wholeMatch,m1,m2,m3){var c=m3;c=c.replace(/^([ \t]*)/g,"");// leading whitespace
c=c.replace(/[ \t]*$/g,"");// trailing whitespace
c=showdown.subParser("makehtml.encodeCode")(c,options,globals);c=m1+"<code>"+c+"</code>";c=showdown.subParser("makehtml.hashHTMLSpans")(c,options,globals);return c});text=globals.converter._dispatch("makehtml.codeSpans.after",text,options,globals).getText();return text});/**
     * Create a full HTML document from the processed markdown
     */showdown.subParser("makehtml.completeHTMLDocument",function(text,options,globals){'use strict';if(!options.completeHTMLDocument){return text}text=globals.converter._dispatch("makehtml.completeHTMLDocument.before",text,options,globals).getText();var doctype="html",doctypeParsed="<!DOCTYPE HTML>\n",title="",charset="<meta charset=\"utf-8\">\n",lang="",metadata="";if("undefined"!==typeof globals.metadata.parsed.doctype){doctypeParsed="<!DOCTYPE "+globals.metadata.parsed.doctype+">\n";doctype=globals.metadata.parsed.doctype.toString().toLowerCase();if("html"===doctype||"html5"===doctype){charset="<meta charset=\"utf-8\">"}}for(var meta in globals.metadata.parsed){if(globals.metadata.parsed.hasOwnProperty(meta)){switch(meta.toLowerCase()){case"doctype":break;case"title":title="<title>"+globals.metadata.parsed.title+"</title>\n";break;case"charset":if("html"===doctype||"html5"===doctype){charset="<meta charset=\""+globals.metadata.parsed.charset+"\">\n"}else{charset="<meta name=\"charset\" content=\""+globals.metadata.parsed.charset+"\">\n"}break;case"language":case"lang":lang=" lang=\""+globals.metadata.parsed[meta]+"\"";metadata+="<meta name=\""+meta+"\" content=\""+globals.metadata.parsed[meta]+"\">\n";break;default:metadata+="<meta name=\""+meta+"\" content=\""+globals.metadata.parsed[meta]+"\">\n";}}}text=doctypeParsed+"<html"+lang+">\n<head>\n"+title+charset+metadata+"</head>\n<body>\n"+text.trim()+"\n</body>\n</html>";text=globals.converter._dispatch("makehtml.completeHTMLDocument.after",text,options,globals).getText();return text});/**
     * Convert all tabs to spaces
     */showdown.subParser("makehtml.detab",function(text,options,globals){'use strict';text=globals.converter._dispatch("makehtml.detab.before",text,options,globals).getText();// expand first n-1 tabs
text=text.replace(/\t(?=\t)/g,"    ");// g_tab_width
// replace the nth with two sentinels
text=text.replace(/\t/g,"\xA8A\xA8B");// use the sentinel to anchor our regex so it doesn't explode
text=text.replace(/¨B(.+?)¨A/g,function(wholeMatch,m1){// g_tab_width
// there *must* be a better way to do this:
for(var leadingText=m1,numSpaces=4-leadingText.length%4,i=0;i<numSpaces;i++){leadingText+=" "}return leadingText});// clean up sentinels
text=text.replace(/¨A/g,"    ");// g_tab_width
text=text.replace(/¨B/g,"");text=globals.converter._dispatch("makehtml.detab.after",text,options,globals).getText();return text});showdown.subParser("makehtml.ellipsis",function(text,options,globals){'use strict';text=globals.converter._dispatch("makehtml.ellipsis.before",text,options,globals).getText();text=text.replace(/\.\.\./g,"\u2026");text=globals.converter._dispatch("makehtml.ellipsis.after",text,options,globals).getText();return text});/**
     * These are all the transformations that occur *within* block-level
     * tags like paragraphs, headers, and list items.
     */showdown.subParser("makehtml.emoji",function(text,options,globals){'use strict';if(!options.emoji){return text}text=globals.converter._dispatch("makehtml.emoji.before",text,options,globals).getText();var emojiRgx=/:([\S]+?):/g;text=text.replace(emojiRgx,function(wm,emojiCode){if(showdown.helper.emojis.hasOwnProperty(emojiCode)){return showdown.helper.emojis[emojiCode]}return wm});text=globals.converter._dispatch("makehtml.emoji.after",text,options,globals).getText();return text});/**
     * Smart processing for ampersands and angle brackets that need to be encoded.
     */showdown.subParser("makehtml.encodeAmpsAndAngles",function(text,options,globals){'use strict';text=globals.converter._dispatch("makehtml.encodeAmpsAndAngles.before",text,options,globals).getText();// Ampersand-encoding based entirely on Nat Irons's Amputator MT plugin:
// http://bumppo.net/projects/amputator/
text=text.replace(/&(?!#?[xX]?(?:[0-9a-fA-F]+|\w+);)/g,"&amp;");// Encode naked <'s
text=text.replace(/<(?![a-z\/?$!])/gi,"&lt;");// Encode <
text=text.replace(/</g,"&lt;");// Encode >
text=text.replace(/>/g,"&gt;");text=globals.converter._dispatch("makehtml.encodeAmpsAndAngles.after",text,options,globals).getText();return text});/**
     * Returns the string, with after processing the following backslash escape sequences.
     *
     * attacklab: The polite way to do this is with the new escapeCharacters() function:
     *
     *    text = escapeCharacters(text,"\\",true);
     *    text = escapeCharacters(text,"`*_{}[]()>#+-.!",true);
     *
     * ...but we're sidestepping its use of the (slow) RegExp constructor
     * as an optimization for Firefox.  This function gets called a LOT.
     */showdown.subParser("makehtml.encodeBackslashEscapes",function(text,options,globals){'use strict';text=globals.converter._dispatch("makehtml.encodeBackslashEscapes.before",text,options,globals).getText();text=text.replace(/\\(\\)/g,showdown.helper.escapeCharactersCallback);text=text.replace(/\\([`*_{}\[\]()>#+.!~=|:-])/g,showdown.helper.escapeCharactersCallback);text=globals.converter._dispatch("makehtml.encodeBackslashEscapes.after",text,options,globals).getText();return text});/**
     * Encode/escape certain characters inside Markdown code runs.
     * The point is that in code, these characters are literals,
     * and lose their special Markdown meanings.
     */showdown.subParser("makehtml.encodeCode",function(text,options,globals){'use strict';text=globals.converter._dispatch("makehtml.encodeCode.before",text,options,globals).getText();// Encode all ampersands; HTML entities are not
// entities within a Markdown code span.
text=text.replace(/&/g,"&amp;")// Do the angle bracket song and dance:
.replace(/</g,"&lt;").replace(/>/g,"&gt;")// Now, escape characters that are magic in Markdown:
.replace(/([*_{}\[\]\\=~-])/g,showdown.helper.escapeCharactersCallback);text=globals.converter._dispatch("makehtml.encodeCode.after",text,options,globals).getText();return text});/**
     * Within tags -- meaning between < and > -- encode [\ ` * _ ~ =] so they
     * don't conflict with their use in Markdown for code, italics and strong.
     */showdown.subParser("makehtml.escapeSpecialCharsWithinTagAttributes",function(text,options,globals){'use strict';text=globals.converter._dispatch("makehtml.escapeSpecialCharsWithinTagAttributes.before",text,options,globals).getText();// Build a regex to find HTML tags.
var tags=/<\/?[a-z\d_:-]+(?:[\s]+[\s\S]+?)?>/gi,comments=/<!(--(?:(?:[^>-]|-[^>])(?:[^-]|-[^-])*)--)>/gi;text=text.replace(tags,function(wholeMatch){return wholeMatch.replace(/(.)<\/?code>(?=.)/g,"$1`").replace(/([\\`*_~=|])/g,showdown.helper.escapeCharactersCallback)});text=text.replace(comments,function(wholeMatch){return wholeMatch.replace(/([\\`*_~=|])/g,showdown.helper.escapeCharactersCallback)});text=globals.converter._dispatch("makehtml.escapeSpecialCharsWithinTagAttributes.after",text,options,globals).getText();return text});/**
     * Handle github codeblocks prior to running HashHTML so that
     * HTML contained within the codeblock gets escaped properly
     * Example:
     * ```ruby
     *     def hello_world(x)
     *       puts "Hello, #{x}"
     *     end
     * ```
     */showdown.subParser("makehtml.githubCodeBlocks",function(text,options,globals){'use strict';// early exit if option is not enabled
if(!options.ghCodeBlocks){return text}text=globals.converter._dispatch("makehtml.githubCodeBlocks.before",text,options,globals).getText();text+="\xA80";text=text.replace(/(?:^|\n)(?: {0,3})(```+|~~~+)(?: *)([^\s`~]*)\n([\s\S]*?)\n(?: {0,3})\1/g,function(wholeMatch,delim,language,codeblock){var end=options.omitExtraWLInCodeBlocks?"":"\n";// First parse the github code block
codeblock=showdown.subParser("makehtml.encodeCode")(codeblock,options,globals);codeblock=showdown.subParser("makehtml.detab")(codeblock,options,globals);codeblock=codeblock.replace(/^\n+/g,"");// trim leading newlines
codeblock=codeblock.replace(/\n+$/g,"");// trim trailing whitespace
codeblock="<pre><code"+(language?" class=\""+language+" language-"+language+"\"":"")+">"+codeblock+end+"</code></pre>";codeblock=showdown.subParser("makehtml.hashBlock")(codeblock,options,globals);// Since GHCodeblocks can be false positives, we need to
// store the primitive text and the parsed text in a global var,
// and then return a token
return"\n\n\xA8G"+(globals.ghCodeBlocks.push({text:wholeMatch,codeblock:codeblock})-1)+"G\n\n"});// attacklab: strip sentinel
text=text.replace(/¨0/,"");return globals.converter._dispatch("makehtml.githubCodeBlocks.after",text,options,globals).getText()});showdown.subParser("makehtml.hashBlock",function(text,options,globals){'use strict';text=globals.converter._dispatch("makehtml.hashBlock.before",text,options,globals).getText();text=text.replace(/(^\n+|\n+$)/g,"");text="\n\n\xA8K"+(globals.gHtmlBlocks.push(text)-1)+"K\n\n";text=globals.converter._dispatch("makehtml.hashBlock.after",text,options,globals).getText();return text});/**
     * Hash and escape <code> elements that should not be parsed as markdown
     */showdown.subParser("makehtml.hashCodeTags",function(text,options,globals){'use strict';text=globals.converter._dispatch("makehtml.hashCodeTags.before",text,options,globals).getText();var repFunc=function(wholeMatch,match,left,right){var codeblock=left+showdown.subParser("makehtml.encodeCode")(match,options,globals)+right;return"\xA8C"+(globals.gHtmlSpans.push(codeblock)-1)+"C"};// Hash naked <code>
text=showdown.helper.replaceRecursiveRegExp(text,repFunc,"<code\\b[^>]*>","</code>","gim");text=globals.converter._dispatch("makehtml.hashCodeTags.after",text,options,globals).getText();return text});showdown.subParser("makehtml.hashElement",function(text,options,globals){'use strict';return function(wholeMatch,m1){var blockText=m1;// Undo double lines
blockText=blockText.replace(/\n\n/g,"\n");blockText=blockText.replace(/^\n/,"");// strip trailing blank lines
blockText=blockText.replace(/\n+$/g,"");// Replace the element text with a marker ("¨KxK" where x is its key)
blockText="\n\n\xA8K"+(globals.gHtmlBlocks.push(blockText)-1)+"K\n\n";return blockText}});showdown.subParser("makehtml.hashHTMLBlocks",function(text,options,globals){'use strict';text=globals.converter._dispatch("makehtml.hashHTMLBlocks.before",text,options,globals).getText();var blockTags=["pre","div","h1","h2","h3","h4","h5","h6","blockquote","table","dl","ol","ul","script","noscript","form","fieldset","iframe","math","style","section","header","footer","nav","article","aside","address","audio","canvas","figure","hgroup","output","video","p"],repFunc=function(wholeMatch,match,left,right){var txt=wholeMatch;// check if this html element is marked as markdown
// if so, it's contents should be parsed as markdown
if(-1!==left.search(/\bmarkdown\b/)){txt=left+globals.converter.makeHtml(match)+right}return"\n\n\xA8K"+(globals.gHtmlBlocks.push(txt)-1)+"K\n\n"};if(options.backslashEscapesHTMLTags){// encode backslash escaped HTML tags
text=text.replace(/\\<(\/?[^>]+?)>/g,function(wm,inside){return"&lt;"+inside+"&gt;"})}// hash HTML Blocks
for(var i=0;i<blockTags.length;++i){var opTagPos,rgx1=new RegExp("^ {0,3}(<"+blockTags[i]+"\\b[^>]*>)","im"),patLeft="<"+blockTags[i]+"\\b[^>]*>",patRight="</"+blockTags[i]+">";// 1. Look for the first position of the first opening HTML tag in the text
while(-1!==(opTagPos=showdown.helper.regexIndexOf(text,rgx1))){// if the HTML tag is \ escaped, we need to escape it and break
//2. Split the text in that position
var subTexts=showdown.helper.splitAtIndex(text,opTagPos),//3. Match recursively
newSubText1=showdown.helper.replaceRecursiveRegExp(subTexts[1],repFunc,patLeft,patRight,"im");// prevent an infinite loop
if(newSubText1===subTexts[1]){break}text=subTexts[0].concat(newSubText1)}}// HR SPECIAL CASE
text=text.replace(/(\n {0,3}(<(hr)\b([^<>])*?\/?>)[ \t]*(?=\n{2,}))/g,showdown.subParser("makehtml.hashElement")(text,options,globals));// Special case for standalone HTML comments
text=showdown.helper.replaceRecursiveRegExp(text,function(txt){return"\n\n\xA8K"+(globals.gHtmlBlocks.push(txt)-1)+"K\n\n"},"^ {0,3}<!--","-->","gm");// PHP and ASP-style processor instructions (<?...?> and <%...%>)
text=text.replace(/(?:\n\n)( {0,3}(?:<([?%])[^\r]*?\2>)[ \t]*(?=\n{2,}))/g,showdown.subParser("makehtml.hashElement")(text,options,globals));text=globals.converter._dispatch("makehtml.hashHTMLBlocks.after",text,options,globals).getText();return text});/**
     * Hash span elements that should not be parsed as markdown
     */showdown.subParser("makehtml.hashHTMLSpans",function(text,options,globals){'use strict';text=globals.converter._dispatch("makehtml.hashHTMLSpans.before",text,options,globals).getText();// Hash Self Closing tags
text=text.replace(/<[^>]+?\/>/gi,function(wm){return showdown.helper._hashHTMLSpan(wm,globals)});// Hash tags without properties
text=text.replace(/<([^>]+?)>[\s\S]*?<\/\1>/g,function(wm){return showdown.helper._hashHTMLSpan(wm,globals)});// Hash tags with properties
text=text.replace(/<([^>]+?)\s[^>]+?>[\s\S]*?<\/\1>/g,function(wm){return showdown.helper._hashHTMLSpan(wm,globals)});// Hash self closing tags without />
text=text.replace(/<[^>]+?>/gi,function(wm){return showdown.helper._hashHTMLSpan(wm,globals)});text=globals.converter._dispatch("makehtml.hashHTMLSpans.after",text,options,globals).getText();return text});/**
     * Unhash HTML spans
     */showdown.subParser("makehtml.unhashHTMLSpans",function(text,options,globals){'use strict';text=globals.converter._dispatch("makehtml.unhashHTMLSpans.before",text,options,globals).getText();for(var i=0;i<globals.gHtmlSpans.length;++i){var repText=globals.gHtmlSpans[i],// limiter to prevent infinite loop (assume 10 as limit for recurse)
limit=0;while(/¨C(\d+)C/.test(repText)){var num=RegExp.$1;repText=repText.replace("\xA8C"+num+"C",globals.gHtmlSpans[num]);if(10===limit){console.error("maximum nesting of 10 spans reached!!!");break}++limit}text=text.replace("\xA8C"+i+"C",repText)}text=globals.converter._dispatch("makehtml.unhashHTMLSpans.after",text,options,globals).getText();return text});/**
     * Hash and escape <pre><code> elements that should not be parsed as markdown
     */showdown.subParser("makehtml.hashPreCodeTags",function(text,options,globals){'use strict';text=globals.converter._dispatch("makehtml.hashPreCodeTags.before",text,options,globals).getText();var repFunc=function(wholeMatch,match,left,right){// encode html entities
var codeblock=left+showdown.subParser("makehtml.encodeCode")(match,options,globals)+right;return"\n\n\xA8G"+(globals.ghCodeBlocks.push({text:wholeMatch,codeblock:codeblock})-1)+"G\n\n"};// Hash <pre><code>
text=showdown.helper.replaceRecursiveRegExp(text,repFunc,"^ {0,3}<pre\\b[^>]*>\\s*<code\\b[^>]*>","^ {0,3}</code>\\s*</pre>","gim");text=globals.converter._dispatch("makehtml.hashPreCodeTags.after",text,options,globals).getText();return text});showdown.subParser("makehtml.headers",function(text,options,globals){'use strict';text=globals.converter._dispatch("makehtml.headers.before",text,options,globals).getText();var headerLevelStart=isNaN(parseInt(options.headerLevelStart))?1:parseInt(options.headerLevelStart),// Set text-style headers:
//	Header 1
//	========
//
//	Header 2
//	--------
//
setextRegexH1=options.smoothLivePreview?/^(.+)[ \t]*\n={2,}[ \t]*\n+/gm:/^(.+)[ \t]*\n=+[ \t]*\n+/gm,setextRegexH2=options.smoothLivePreview?/^(.+)[ \t]*\n-{2,}[ \t]*\n+/gm:/^(.+)[ \t]*\n-+[ \t]*\n+/gm;text=text.replace(setextRegexH1,function(wholeMatch,m1){var spanGamut=showdown.subParser("makehtml.spanGamut")(m1,options,globals),hID=options.noHeaderId?"":" id=\""+headerId(m1)+"\"",hLevel=headerLevelStart,hashBlock="<h"+hLevel+hID+">"+spanGamut+"</h"+hLevel+">";return showdown.subParser("makehtml.hashBlock")(hashBlock,options,globals)});text=text.replace(setextRegexH2,function(matchFound,m1){var spanGamut=showdown.subParser("makehtml.spanGamut")(m1,options,globals),hID=options.noHeaderId?"":" id=\""+headerId(m1)+"\"",hLevel=headerLevelStart+1,hashBlock="<h"+hLevel+hID+">"+spanGamut+"</h"+hLevel+">";return showdown.subParser("makehtml.hashBlock")(hashBlock,options,globals)});// atx-style headers:
//  # Header 1
//  ## Header 2
//  ## Header 2 with closing hashes ##
//  ...
//  ###### Header 6
//
var atxStyle=options.requireSpaceBeforeHeadingText?/^(#{1,6})[ \t]+(.+?)[ \t]*#*\n+/gm:/^(#{1,6})[ \t]*(.+?)[ \t]*#*\n+/gm;text=text.replace(atxStyle,function(wholeMatch,m1,m2){var hText=m2;if(options.customizedHeaderId){hText=m2.replace(/\s?\{([^{]+?)}\s*$/,"")}var span=showdown.subParser("makehtml.spanGamut")(hText,options,globals),hID=options.noHeaderId?"":" id=\""+headerId(m2)+"\"",hLevel=headerLevelStart-1+m1.length,header="<h"+hLevel+hID+">"+span+"</h"+hLevel+">";return showdown.subParser("makehtml.hashBlock")(header,options,globals)});function headerId(m){var title,prefix;// It is separate from other options to allow combining prefix and customized
if(options.customizedHeaderId){var match=m.match(/\{([^{]+?)}\s*$/);if(match&&match[1]){m=match[1]}}title=m;// Prefix id to prevent causing inadvertent pre-existing style matches.
if(showdown.helper.isString(options.prefixHeaderId)){prefix=options.prefixHeaderId}else if(!0===options.prefixHeaderId){prefix="section-"}else{prefix=""}if(!options.rawPrefixHeaderId){title=prefix+title}if(options.ghCompatibleHeaderId){title=title.replace(/ /g,"-")// replace previously escaped chars (&, ¨ and $)
.replace(/&amp;/g,"").replace(/¨T/g,"").replace(/¨D/g,"")// replace rest of the chars (&~$ are repeated as they might have been escaped)
// borrowed from github's redcarpet (some they should produce similar results)
.replace(/[&+$,\/:;=?@"#{}|^¨~\[\]`\\*)(%.!'<>]/g,"").toLowerCase()}else if(options.rawHeaderId){title=title.replace(/ /g,"-")// replace previously escaped chars (&, ¨ and $)
.replace(/&amp;/g,"&").replace(/¨T/g,"\xA8").replace(/¨D/g,"$")// replace " and '
.replace(/["']/g,"-").toLowerCase()}else{title=title.replace(/[^\w]/g,"").toLowerCase()}if(options.rawPrefixHeaderId){title=prefix+title}if(globals.hashLinkCounts[title]){title=title+"-"+globals.hashLinkCounts[title]++}else{globals.hashLinkCounts[title]=1}return title}text=globals.converter._dispatch("makehtml.headers.after",text,options,globals).getText();return text});/**
     * Turn Markdown horizontal rule shortcuts into <hr /> tags.
     *
     * Any 3 or more unindented consecutive hyphens, asterisks or underscores with or without a space beetween them
     * in a single line is considered a horizontal rule
     */showdown.subParser("makehtml.horizontalRule",function(text,options,globals){'use strict';text=globals.converter._dispatch("makehtml.horizontalRule.before",text,options,globals).getText();var key=showdown.subParser("makehtml.hashBlock")("<hr />",options,globals);text=text.replace(/^ {0,2}( ?-){3,}[ \t]*$/gm,key);text=text.replace(/^ {0,2}( ?\*){3,}[ \t]*$/gm,key);text=text.replace(/^ {0,2}( ?_){3,}[ \t]*$/gm,key);text=globals.converter._dispatch("makehtml.horizontalRule.after",text,options,globals).getText();return text});/**
     * Turn Markdown image shortcuts into <img> tags.
     */showdown.subParser("makehtml.images",function(text,options,globals){'use strict';text=globals.converter._dispatch("makehtml.images.before",text,options,globals).getText();var inlineRegExp=/!\[([^\]]*?)][ \t]*()\([ \t]?<?([\S]+?(?:\([\S]*?\)[\S]*?)?)>?(?: =([*\d]+[A-Za-z%]{0,4})x([*\d]+[A-Za-z%]{0,4}))?[ \t]*(?:(["'])([^"]*?)\6)?[ \t]?\)/g,crazyRegExp=/!\[([^\]]*?)][ \t]*()\([ \t]?<([^>]*)>(?: =([*\d]+[A-Za-z%]{0,4})x([*\d]+[A-Za-z%]{0,4}))?[ \t]*(?:(?:(["'])([^"]*?)\6))?[ \t]?\)/g,base64RegExp=/!\[([^\]]*?)][ \t]*()\([ \t]?<?(data:.+?\/.+?;base64,[A-Za-z0-9+/=\n]+?)>?(?: =([*\d]+[A-Za-z%]{0,4})x([*\d]+[A-Za-z%]{0,4}))?[ \t]*(?:(["'])([^"]*?)\6)?[ \t]?\)/g,referenceRegExp=/!\[([^\]]*?)] ?(?:\n *)?\[([\s\S]*?)]()()()()()/g,refShortcutRegExp=/!\[([^\[\]]+)]()()()()()/g;function writeImageTagBase64(wholeMatch,altText,linkId,url,width,height,m5,title){url=url.replace(/\s/g,"");return writeImageTag(wholeMatch,altText,linkId,url,width,height,m5,title)}function writeImageTag(wholeMatch,altText,linkId,url,width,height,m5,title){var gUrls=globals.gUrls,gTitles=globals.gTitles,gDims=globals.gDimensions;linkId=linkId.toLowerCase();if(!title){title=""}// Special case for explicit empty url
if(-1<wholeMatch.search(/\(<?\s*>? ?(['"].*['"])?\)$/m)){url=""}else if(""===url||null===url){if(""===linkId||null===linkId){// lower-case and turn embedded newlines into spaces
linkId=altText.toLowerCase().replace(/ ?\n/g," ")}url="#"+linkId;if(!showdown.helper.isUndefined(gUrls[linkId])){url=gUrls[linkId];if(!showdown.helper.isUndefined(gTitles[linkId])){title=gTitles[linkId]}if(!showdown.helper.isUndefined(gDims[linkId])){width=gDims[linkId].width;height=gDims[linkId].height}}else{return wholeMatch}}altText=altText.replace(/"/g,"&quot;")//altText = showdown.helper.escapeCharacters(altText, '*_', false);
.replace(showdown.helper.regexes.asteriskDashTildeAndColon,showdown.helper.escapeCharactersCallback);//url = showdown.helper.escapeCharacters(url, '*_', false);
url=url.replace(showdown.helper.regexes.asteriskDashTildeAndColon,showdown.helper.escapeCharactersCallback);var result="<img src=\""+url+"\" alt=\""+altText+"\"";if(title&&showdown.helper.isString(title)){title=title.replace(/"/g,"&quot;")//title = showdown.helper.escapeCharacters(title, '*_', false);
.replace(showdown.helper.regexes.asteriskDashTildeAndColon,showdown.helper.escapeCharactersCallback);result+=" title=\""+title+"\""}if(width&&height){width="*"===width?"auto":width;height="*"===height?"auto":height;result+=" width=\""+width+"\"";result+=" height=\""+height+"\""}result+=" />";return result}// First, handle reference-style labeled images: ![alt text][id]
text=text.replace(referenceRegExp,writeImageTag);// Next, handle inline images:  ![alt text](url =<width>x<height> "optional title")
// base64 encoded images
text=text.replace(base64RegExp,writeImageTagBase64);// cases with crazy urls like ./image/cat1).png
text=text.replace(crazyRegExp,writeImageTag);// normal cases
text=text.replace(inlineRegExp,writeImageTag);// handle reference-style shortcuts: ![img text]
text=text.replace(refShortcutRegExp,writeImageTag);text=globals.converter._dispatch("makehtml.images.after",text,options,globals).getText();return text});showdown.subParser("makehtml.italicsAndBold",function(text,options,globals){'use strict';text=globals.converter._dispatch("makehtml.italicsAndBold.before",text,options,globals).getText();// it's faster to have 3 separate regexes for each case than have just one
// because of backtracing, in some cases, it could lead to an exponential effect
// called "catastrophic backtrace". Ominous!
function parseInside(txt,left,right){return left+txt+right}// Parse underscores
if(options.literalMidWordUnderscores){text=text.replace(/\b___(\S[\s\S]*?)___\b/g,function(wm,txt){return parseInside(txt,"<strong><em>","</em></strong>")});text=text.replace(/\b__(\S[\s\S]*?)__\b/g,function(wm,txt){return parseInside(txt,"<strong>","</strong>")});text=text.replace(/\b_(\S[\s\S]*?)_\b/g,function(wm,txt){return parseInside(txt,"<em>","</em>")})}else{text=text.replace(/___(\S[\s\S]*?)___/g,function(wm,m){return /\S$/.test(m)?parseInside(m,"<strong><em>","</em></strong>"):wm});text=text.replace(/__(\S[\s\S]*?)__/g,function(wm,m){return /\S$/.test(m)?parseInside(m,"<strong>","</strong>"):wm});text=text.replace(/_([^\s_][\s\S]*?)_/g,function(wm,m){// !/^_[^_]/.test(m) - test if it doesn't start with __ (since it seems redundant, we removed it)
return /\S$/.test(m)?parseInside(m,"<em>","</em>"):wm})}// Now parse asterisks
/*
  if (options.literalMidWordAsterisks) {
    text = text.replace(/([^*]|^)\B\*\*\*(\S[\s\S]+?)\*\*\*\B(?!\*)/g, function (wm, lead, txt) {
      return parseInside (txt, lead + '<strong><em>', '</em></strong>');
    });
    text = text.replace(/([^*]|^)\B\*\*(\S[\s\S]+?)\*\*\B(?!\*)/g, function (wm, lead, txt) {
      return parseInside (txt, lead + '<strong>', '</strong>');
    });
    text = text.replace(/([^*]|^)\B\*(\S[\s\S]+?)\*\B(?!\*)/g, function (wm, lead, txt) {
      return parseInside (txt, lead + '<em>', '</em>');
    });
  } else {
  */text=text.replace(/\*\*\*(\S[\s\S]*?)\*\*\*/g,function(wm,m){return /\S$/.test(m)?parseInside(m,"<strong><em>","</em></strong>"):wm});text=text.replace(/\*\*(\S[\s\S]*?)\*\*/g,function(wm,m){return /\S$/.test(m)?parseInside(m,"<strong>","</strong>"):wm});text=text.replace(/\*([^\s*][\s\S]*?)\*/g,function(wm,m){// !/^\*[^*]/.test(m) - test if it doesn't start with ** (since it seems redundant, we removed it)
return /\S$/.test(m)?parseInside(m,"<em>","</em>"):wm});//}
text=globals.converter._dispatch("makehtml.italicsAndBold.after",text,options,globals).getText();return text});////
// makehtml/links.js
// Copyright (c) 2018 ShowdownJS
//
// Transforms MD links into `<a>` html anchors
//
// A link contains link text (the visible text), a link destination (the URI that is the link destination), and
// optionally a link title. There are two basic kinds of links in Markdown.
// In inline links the destination and title are given immediately after the link text.
// In reference links the destination and title are defined elsewhere in the document.
//
// ***Author:***
// - Estevão Soares dos Santos (Tivie) <https://github.com/tivie>
////
(function(){/**
   * Helper function: Wrapper function to pass as second replace parameter
   *
   * @param {RegExp} rgx
   * @param {string} evtRootName
   * @param {{}} options
   * @param {{}} globals
   * @returns {Function}
   */function replaceAnchorTag(rgx,evtRootName,options,globals,emptyCase){emptyCase=!!emptyCase;return function(wholeMatch,text,id,url,m5,m6,title){// bail we we find 2 newlines somewhere
if(/\n\n/.test(wholeMatch)){return wholeMatch}var evt=createEvent(rgx,evtRootName+".captureStart",wholeMatch,text,id,url,title,options,globals);return writeAnchorTag(evt,options,globals,emptyCase)}}/**
     * TODO Normalize this
     * Helper function: Create a capture event
     * @param {RegExp} rgx
     * @param {String} evtName Event name
     * @param {String} wholeMatch
     * @param {String} text
     * @param {String} id
     * @param {String} url
     * @param {String} title
     * @param {{}} options
     * @param {{}} globals
     * @returns {showdown.helper.Event|*}
     */function createEvent(rgx,evtName,wholeMatch,text,id,url,title,options,globals){return globals.converter._dispatch(evtName,wholeMatch,options,globals,{regexp:rgx,matches:{wholeMatch:wholeMatch,text:text,id:id,url:url,title:title}})}/**
     * Helper Function: Normalize and write an anchor tag based on passed parameters
     * @param evt
     * @param options
     * @param globals
     * @param {boolean} emptyCase
     * @returns {string}
     */function writeAnchorTag(evt,options,globals,emptyCase){var wholeMatch=evt.getMatches().wholeMatch,text=evt.getMatches().text,id=evt.getMatches().id,url=evt.getMatches().url,title=evt.getMatches().title,target="";if(!title){title=""}id=id?id.toLowerCase():"";if(emptyCase){url=""}else if(!url){if(!id){// lower-case and turn embedded newlines into spaces
id=text.toLowerCase().replace(/ ?\n/g," ")}url="#"+id;if(!showdown.helper.isUndefined(globals.gUrls[id])){url=globals.gUrls[id];if(!showdown.helper.isUndefined(globals.gTitles[id])){title=globals.gTitles[id]}}else{return wholeMatch}}//url = showdown.helper.escapeCharacters(url, '*_:~', false); // replaced line to improve performance
url=url.replace(showdown.helper.regexes.asteriskDashTildeAndColon,showdown.helper.escapeCharactersCallback);if(""!==title&&null!==title){title=title.replace(/"/g,"&quot;");//title = showdown.helper.escapeCharacters(title, '*_', false); // replaced line to improve performance
title=title.replace(showdown.helper.regexes.asteriskDashTildeAndColon,showdown.helper.escapeCharactersCallback);title=" title=\""+title+"\""}// optionLinksInNewWindow only applies
// to external links. Hash links (#) open in same page
if(options.openLinksInNewWindow&&!/^#/.test(url)){// escaped _
target=" target=\"\xA8E95Eblank\""}// Text can be a markdown element, so we run through the appropriate parsers
text=showdown.subParser("makehtml.codeSpans")(text,options,globals);text=showdown.subParser("makehtml.emoji")(text,options,globals);text=showdown.subParser("makehtml.underline")(text,options,globals);text=showdown.subParser("makehtml.italicsAndBold")(text,options,globals);text=showdown.subParser("makehtml.strikethrough")(text,options,globals);text=showdown.subParser("makehtml.ellipsis")(text,options,globals);text=showdown.subParser("makehtml.hashHTMLSpans")(text,options,globals);//evt = createEvent(rgx, evtRootName + '.captureEnd', wholeMatch, text, id, url, title, options, globals);
var result="<a href=\""+url+"\""+title+target+">"+text+"</a>";//evt = createEvent(rgx, evtRootName + '.beforeHash', wholeMatch, text, id, url, title, options, globals);
result=showdown.subParser("makehtml.hashHTMLSpans")(result,options,globals);return result}var evtRootName="makehtml.links";/**
                                       * Turn Markdown link shortcuts into XHTML <a> tags.
                                       */showdown.subParser("makehtml.links",function(text,options,globals){text=globals.converter._dispatch(evtRootName+".start",text,options,globals).getText();// 1. Handle reference-style links: [link text] [id]
text=showdown.subParser("makehtml.links.reference")(text,options,globals);// 2. Handle inline-style links: [link text](url "optional title")
text=showdown.subParser("makehtml.links.inline")(text,options,globals);// 3. Handle reference-style shortcuts: [link text]
// These must come last in case there's a [link text][1] or [link text](/foo)
text=showdown.subParser("makehtml.links.referenceShortcut")(text,options,globals);// 4. Handle angle brackets links -> `<http://example.com/>`
// Must come after links, because you can use < and > delimiters in inline links like [this](<url>).
text=showdown.subParser("makehtml.links.angleBrackets")(text,options,globals);// 5. Handle GithubMentions (if option is enabled)
text=showdown.subParser("makehtml.links.ghMentions")(text,options,globals);// 6. Handle <a> tags and img tags
text=text.replace(/<a\s[^>]*>[\s\S]*<\/a>/g,function(wholeMatch){return showdown.helper._hashHTMLSpan(wholeMatch,globals)});text=text.replace(/<img\s[^>]*\/?>/g,function(wholeMatch){return showdown.helper._hashHTMLSpan(wholeMatch,globals)});// 7. Handle naked links (if option is enabled)
text=showdown.subParser("makehtml.links.naked")(text,options,globals);text=globals.converter._dispatch(evtRootName+".end",text,options,globals).getText();return text});/**
       * TODO WRITE THIS DOCUMENTATION
       */showdown.subParser("makehtml.links.inline",function(text,options,globals){var evtRootName=evtRootName+".inline";text=globals.converter._dispatch(evtRootName+".start",text,options,globals).getText();// 1. Look for empty cases: []() and [empty]() and []("title")
var rgxEmpty=/\[(.*?)]()()()()\(<? ?>? ?(?:["'](.*)["'])?\)/g;text=text.replace(rgxEmpty,replaceAnchorTag(rgxEmpty,evtRootName,options,globals,!0));// 2. Look for cases with crazy urls like ./image/cat1).png
var rgxCrazy=/\[((?:\[[^\]]*]|[^\[\]])*)]()\s?\([ \t]?<([^>]*)>(?:[ \t]*((["'])([^"]*?)\5))?[ \t]?\)/g;text=text.replace(rgxCrazy,replaceAnchorTag(rgxCrazy,evtRootName,options,globals));// 3. inline links with no title or titles wrapped in ' or ":
// [text](url.com) || [text](<url.com>) || [text](url.com "title") || [text](<url.com> "title")
//var rgx2 = /\[[ ]*[\s]?[ ]*([^\n\[\]]*?)[ ]*[\s]?[ ]*] ?()\(<?[ ]*[\s]?[ ]*([^\s'"]*)>?(?:[ ]*[\n]?[ ]*()(['"])(.*?)\5)?[ ]*[\s]?[ ]*\)/; // this regex is too slow!!!
var rgx2=/\[([\S ]*?)]\s?()\( *<?([^\s'"]*?(?:\([\S]*?\)[\S]*?)?)>?\s*(?:()(['"])(.*?)\5)? *\)/g;text=text.replace(rgx2,replaceAnchorTag(rgx2,evtRootName,options,globals));// 4. inline links with titles wrapped in (): [foo](bar.com (title))
var rgx3=/\[([\S ]*?)]\s?()\( *<?([^\s'"]*?(?:\([\S]*?\)[\S]*?)?)>?\s+()()\((.*?)\) *\)/g;text=text.replace(rgx3,replaceAnchorTag(rgx3,evtRootName,options,globals));text=globals.converter._dispatch(evtRootName+".end",text,options,globals).getText();return text});/**
       * TODO WRITE THIS DOCUMENTATION
       */showdown.subParser("makehtml.links.reference",function(text,options,globals){var evtRootName=evtRootName+".reference";text=globals.converter._dispatch(evtRootName+".start",text,options,globals).getText();var rgx=/\[((?:\[[^\]]*]|[^\[\]])*)] ?(?:\n *)?\[(.*?)]()()()()/g;text=text.replace(rgx,replaceAnchorTag(rgx,evtRootName,options,globals));text=globals.converter._dispatch(evtRootName+".end",text,options,globals).getText();return text});/**
       * TODO WRITE THIS DOCUMENTATION
       */showdown.subParser("makehtml.links.referenceShortcut",function(text,options,globals){var evtRootName=evtRootName+".referenceShortcut";text=globals.converter._dispatch(evtRootName+".start",text,options,globals).getText();var rgx=/\[([^\[\]]+)]()()()()()/g;text=text.replace(rgx,replaceAnchorTag(rgx,evtRootName,options,globals));text=globals.converter._dispatch(evtRootName+".end",text,options,globals).getText();return text});/**
       * TODO WRITE THIS DOCUMENTATION
       */showdown.subParser("makehtml.links.ghMentions",function(text,options,globals){var evtRootName=evtRootName+"ghMentions";if(!options.ghMentions){return text}text=globals.converter._dispatch(evtRootName+".start",text,options,globals).getText();var rgx=/(^|\s)(\\)?(@([a-z\d]+(?:[a-z\d._-]+?[a-z\d]+)*))/gi;text=text.replace(rgx,function(wholeMatch,st,escape,mentions,username){// bail if the mentions was escaped
if("\\"===escape){return st+mentions}// check if options.ghMentionsLink is a string
// TODO Validation should be done at initialization not at runtime
if(!showdown.helper.isString(options.ghMentionsLink)){throw new Error("ghMentionsLink option must be a string")}var url=options.ghMentionsLink.replace(/{u}/g,username),evt=createEvent(rgx,evtRootName+".captureStart",wholeMatch,mentions,null,url,null,options,globals);// captureEnd Event is triggered inside writeAnchorTag function
return st+writeAnchorTag(evt,options,globals)});text=globals.converter._dispatch(evtRootName+".end",text,options,globals).getText();return text});/**
       * TODO WRITE THIS DOCUMENTATION
       */showdown.subParser("makehtml.links.angleBrackets",function(text,options,globals){var evtRootName="makehtml.links.angleBrackets";text=globals.converter._dispatch(evtRootName+".start",text,options,globals).getText();// 1. Parse links first
var urlRgx=/<(((?:https?|ftp):\/\/|www\.)[^'">\s]+)>/gi;text=text.replace(urlRgx,function(wholeMatch,url,urlStart){var text=url;url="www."===urlStart?"http://"+url:url;var evt=createEvent(urlRgx,evtRootName+".captureStart",wholeMatch,text,null,url,null,options,globals);return writeAnchorTag(evt,options,globals)});// 2. Then Mail Addresses
var mailRgx=/<(?:mailto:)?([-.\w]+@[-a-z0-9]+(\.[-a-z0-9]+)*\.[a-z]+)>/gi;text=text.replace(mailRgx,function(wholeMatch,mail){var url="mailto:";mail=showdown.subParser("makehtml.unescapeSpecialChars")(mail,options,globals);if(options.encodeEmails){url=showdown.helper.encodeEmailAddress(url+mail);mail=showdown.helper.encodeEmailAddress(mail)}else{url=url+mail}var evt=createEvent(mailRgx,evtRootName+".captureStart",wholeMatch,mail,null,url,null,options,globals);return writeAnchorTag(evt,options,globals)});text=globals.converter._dispatch(evtRootName+".end",text,options,globals).getText();return text});/**
       * TODO MAKE THIS WORK (IT'S NOT ACTIVATED)
       * TODO WRITE THIS DOCUMENTATION
       */showdown.subParser("makehtml.links.naked",function(text,options,globals){if(!options.simplifiedAutoLink){return text}var evtRootName="makehtml.links.naked";text=globals.converter._dispatch(evtRootName+".start",text,options,globals).getText();// 2. Now we check for
// we also include leading markdown magic chars [_*~] for cases like __https://www.google.com/foobar__
var urlRgx=/([_*~]*?)(((?:https?|ftp):\/\/|www\.)[^\s<>"'`´.-][^\s<>"'`´]*?\.[a-z\d.]+[^\s<>"']*)\1/gi;text=text.replace(urlRgx,function(wholeMatch,leadingMDChars,url,urlPrefix){// we now will start traversing the url from the front to back, looking for punctuation chars [_*~,;:.!?\)\]]
for(var len=url.length,suffix="",i=len-1,char;0<=i;--i){char=url.charAt(i);if(/[_*~,;:.!?]/.test(char)){// it's a punctuation char
// we remove it from the url
url=url.slice(0,-1);// and prepend it to the suffix
suffix=char+suffix}else if(/\)/.test(char)){var opPar=url.match(/\(/g)||[],clPar=url.match(/\)/g);// it's a curved parenthesis so we need to check for "balance" (kinda)
if(opPar.length<clPar.length){// there are more closing Parenthesis than opening so chop it!!!!!
url=url.slice(0,-1);// and prepend it to the suffix
suffix=char+suffix}else{// it's (kinda) balanced so our work is done
break}}else if(/]/.test(char)){var opPar2=url.match(/\[/g)||[],clPar2=url.match(/\]/g);// it's a squared parenthesis so we need to check for "balance" (kinda)
if(opPar2.length<clPar2.length){// there are more closing Parenthesis than opening so chop it!!!!!
url=url.slice(0,-1);// and prepend it to the suffix
suffix=char+suffix}else{// it's (kinda) balanced so our work is done
break}}else{// it's not a punctuation or a parenthesis so our work is done
break}}// we copy the treated url to the text variable
var text=url;// finally, if it's a www shortcut, we prepend http
url="www."===urlPrefix?"http://"+url:url;// url part is done so let's take care of text now
// we need to escape the text (because of links such as www.example.com/foo__bar__baz)
text=text.replace(showdown.helper.regexes.asteriskDashTildeAndColon,showdown.helper.escapeCharactersCallback);// finally we dispatch the event
var evt=createEvent(urlRgx,evtRootName+".captureStart",wholeMatch,text,null,url,null,options,globals);// and return the link tag, with the leadingMDChars and  suffix. The leadingMDChars are added at the end too because
// we consumed those characters in the regexp
return leadingMDChars+writeAnchorTag(evt,options,globals)+suffix+leadingMDChars});// 2. Then mails
var mailRgx=/(^|\s)(?:mailto:)?([A-Za-z0-9!#$%&'*+-/=?^_`{|}~.]+@[-a-z0-9]+(\.[-a-z0-9]+)*\.[a-z]+)(?=$|\s)/gmi;text=text.replace(mailRgx,function(wholeMatch,leadingChar,mail){var url="mailto:";mail=showdown.subParser("makehtml.unescapeSpecialChars")(mail,options,globals);if(options.encodeEmails){url=showdown.helper.encodeEmailAddress(url+mail);mail=showdown.helper.encodeEmailAddress(mail)}else{url=url+mail}var evt=createEvent(mailRgx,evtRootName+".captureStart",wholeMatch,mail,null,url,null,options,globals);return leadingChar+writeAnchorTag(evt,options,globals)});text=globals.converter._dispatch(evtRootName+".end",text,options,globals).getText();return text})})();/**
       * Form HTML ordered (numbered) and unordered (bulleted) lists.
       */showdown.subParser("makehtml.lists",function(text,options,globals){'use strict';/**
                 * Process the contents of a single ordered or unordered list, splitting it
                 * into individual list items.
                 * @param {string} listStr
                 * @param {boolean} trimTrailing
                 * @returns {string}
                 */function processListItems(listStr,trimTrailing){// The $g_list_level global keeps track of when we're inside a list.
// Each time we enter a list, we increment it; when we leave a list,
// we decrement. If it's zero, we're not in a list anymore.
//
// We do this because when we're not inside a list, we want to treat
// something like this:
//
//    I recommend upgrading to version
//    8. Oops, now this line is treated
//    as a sub-list.
//
// As a single paragraph, despite the fact that the second line starts
// with a digit-period-space sequence.
//
// Whereas when we're inside a list (or sub-list), that line will be
// treated as the start of a sub-list. What a kludge, huh? This is
// an aspect of Markdown's syntax that's hard to parse perfectly
// without resorting to mind-reading. Perhaps the solution is to
// change the syntax rules such that sub-lists must start with a
// starting cardinal number; e.g. "1." or "a.".
globals.gListLevel++;// trim trailing blank lines:
listStr=listStr.replace(/\n{2,}$/,"\n");// attacklab: add sentinel to emulate \z
listStr+="\xA80";var rgx=/(\n)?(^ {0,3})([*+-]|\d+[.])[ \t]+((\[(x|X| )?])?[ \t]*[^\r]+?(\n{1,2}))(?=\n*(¨0| {0,3}([*+-]|\d+[.])[ \t]+))/gm,isParagraphed=/\n[ \t]*\n(?!¨0)/.test(listStr);// Since version 1.5, nesting sublists requires 4 spaces (or 1 tab) indentation,
// which is a syntax breaking change
// activating this option reverts to old behavior
// This will be removed in version 2.0
if(options.disableForced4SpacesIndentedSublists){rgx=/(\n)?(^ {0,3})([*+-]|\d+[.])[ \t]+((\[(x|X| )?])?[ \t]*[^\r]+?(\n{1,2}))(?=\n*(¨0|\2([*+-]|\d+[.])[ \t]+))/gm}listStr=listStr.replace(rgx,function(wholeMatch,m1,m2,m3,m4,taskbtn,checked){checked=checked&&""!==checked.trim();var item=showdown.subParser("makehtml.outdent")(m4,options,globals),bulletStyle="";// Support for github tasklists
if(taskbtn&&options.tasklists){bulletStyle=" class=\"task-list-item\" style=\"list-style-type: none;\"";item=item.replace(/^[ \t]*\[(x|X| )?]/m,function(){var otp="<input type=\"checkbox\" disabled style=\"margin: 0px 0.35em 0.25em -1.6em; vertical-align: middle;\"";if(checked){otp+=" checked"}otp+=">";return otp})}// ISSUE #312
// This input: - - - a
// causes trouble to the parser, since it interprets it as:
// <ul><li><li><li>a</li></li></li></ul>
// instead of:
// <ul><li>- - a</li></ul>
// So, to prevent it, we will put a marker (¨A)in the beginning of the line
// Kind of hackish/monkey patching, but seems more effective than overcomplicating the list parser
item=item.replace(/^([-*+]|\d\.)[ \t]+[\S\n ]*/g,function(wm2){return"\xA8A"+wm2});// SPECIAL CASE: an heading followed by a paragraph of text that is not separated by a double newline
// or/nor indented. ex:
//
// - # foo
// bar is great
//
// While this does now follow the spec per se, not allowing for this might cause confusion since
// header blocks don't need double newlines after
if(/^#+.+\n.+/.test(item)){item=item.replace(/^(#+.+)$/m,"$1\n")}// m1 - Leading line or
// Has a double return (multi paragraph)
if(m1||-1<item.search(/\n{2,}/)){item=showdown.subParser("makehtml.githubCodeBlocks")(item,options,globals);item=showdown.subParser("makehtml.blockGamut")(item,options,globals)}else{// Recursion for sub-lists:
item=showdown.subParser("makehtml.lists")(item,options,globals);item=item.replace(/\n$/,"");// chomp(item)
item=showdown.subParser("makehtml.hashHTMLBlocks")(item,options,globals);// Colapse double linebreaks
item=item.replace(/\n\n+/g,"\n\n");if(isParagraphed){item=showdown.subParser("makehtml.paragraphs")(item,options,globals)}else{item=showdown.subParser("makehtml.spanGamut")(item,options,globals)}}// now we need to remove the marker (¨A)
item=item.replace("\xA8A","");// we can finally wrap the line in list item tags
item="<li"+bulletStyle+">"+item+"</li>\n";return item});// attacklab: strip sentinel
listStr=listStr.replace(/¨0/g,"");globals.gListLevel--;if(trimTrailing){listStr=listStr.replace(/\s+$/,"")}return listStr}function styleStartNumber(list,listType){// check if ol and starts by a number different than 1
if("ol"===listType){var res=list.match(/^ *(\d+)\./);if(res&&"1"!==res[1]){return" start=\""+res[1]+"\""}}return""}/**
     * Check and parse consecutive lists (better fix for issue #142)
     * @param {string} list
     * @param {string} listType
     * @param {boolean} trimTrailing
     * @returns {string}
     */function parseConsecutiveLists(list,listType,trimTrailing){// check if we caught 2 or more consecutive lists by mistake
// we use the counterRgx, meaning if listType is UL we look for OL and vice versa
var olRgx=options.disableForced4SpacesIndentedSublists?/^ ?\d+\.[ \t]/gm:/^ {0,3}\d+\.[ \t]/gm,ulRgx=options.disableForced4SpacesIndentedSublists?/^ ?[*+-][ \t]/gm:/^ {0,3}[*+-][ \t]/gm,counterRxg="ul"===listType?olRgx:ulRgx,result="";if(-1!==list.search(counterRxg)){(function parseCL(txt){var pos=txt.search(counterRxg),style=styleStartNumber(list,listType);if(-1!==pos){// slice
result+="\n\n<"+listType+style+">\n"+processListItems(txt.slice(0,pos),!!trimTrailing)+"</"+listType+">\n";// invert counterType and listType
listType="ul"===listType?"ol":"ul";counterRxg="ul"===listType?olRgx:ulRgx;//recurse
parseCL(txt.slice(pos))}else{result+="\n\n<"+listType+style+">\n"+processListItems(txt,!!trimTrailing)+"</"+listType+">\n"}})(list)}else{var style=styleStartNumber(list,listType);result="\n\n<"+listType+style+">\n"+processListItems(list,!!trimTrailing)+"</"+listType+">\n"}return result}// Start of list parsing
var subListRgx=/^(( {0,3}([*+-]|\d+[.])[ \t]+)[^\r]+?(¨0|\n{2,}(?=\S)(?![ \t]*(?:[*+-]|\d+[.])[ \t]+)))/gm,mainListRgx=/(\n\n|^\n?)(( {0,3}([*+-]|\d+[.])[ \t]+)[^\r]+?(¨0|\n{2,}(?=\S)(?![ \t]*(?:[*+-]|\d+[.])[ \t]+)))/gm;text=globals.converter._dispatch("lists.before",text,options,globals).getText();// add sentinel to hack around khtml/safari bug:
// http://bugs.webkit.org/show_bug.cgi?id=11231
text+="\xA80";if(globals.gListLevel){text=text.replace(subListRgx,function(wholeMatch,list,m2){var listType=-1<m2.search(/[*+-]/g)?"ul":"ol";return parseConsecutiveLists(list,listType,!0)})}else{text=text.replace(mainListRgx,function(wholeMatch,m1,list,m3){var listType=-1<m3.search(/[*+-]/g)?"ul":"ol";return parseConsecutiveLists(list,listType,!1)})}// strip sentinel
text=text.replace(/¨0/,"");text=globals.converter._dispatch("makehtml.lists.after",text,options,globals).getText();return text});/**
     * Parse metadata at the top of the document
     */showdown.subParser("makehtml.metadata",function(text,options,globals){'use strict';if(!options.metadata){return text}text=globals.converter._dispatch("makehtml.metadata.before",text,options,globals).getText();function parseMetadataContents(content){// raw is raw so it's not changed in any way
globals.metadata.raw=content;// escape chars forbidden in html attributes
// double quotes
content=content// ampersand first
.replace(/&/g,"&amp;")// double quotes
.replace(/"/g,"&quot;");content=content.replace(/\n {4}/g," ");content.replace(/^([\S ]+): +([\s\S]+?)$/gm,function(wm,key,value){globals.metadata.parsed[key]=value;return""})}text=text.replace(/^\s*«««+(\S*?)\n([\s\S]+?)\n»»»+\n/,function(wholematch,format,content){parseMetadataContents(content);return"\xA8M"});text=text.replace(/^\s*---+(\S*?)\n([\s\S]+?)\n---+\n/,function(wholematch,format,content){if(format){globals.metadata.format=format}parseMetadataContents(content);return"\xA8M"});text=text.replace(/¨M/g,"");text=globals.converter._dispatch("makehtml.metadata.after",text,options,globals).getText();return text});/**
     * Remove one level of line-leading tabs or spaces
     */showdown.subParser("makehtml.outdent",function(text,options,globals){'use strict';text=globals.converter._dispatch("makehtml.outdent.before",text,options,globals).getText();// attacklab: hack around Konqueror 3.5.4 bug:
// "----------bug".replace(/^-/g,"") == "bug"
text=text.replace(/^(\t|[ ]{1,4})/gm,"\xA80");// attacklab: g_tab_width
// attacklab: clean up hack
text=text.replace(/¨0/g,"");text=globals.converter._dispatch("makehtml.outdent.after",text,options,globals).getText();return text});/**
     *
     */showdown.subParser("makehtml.paragraphs",function(text,options,globals){'use strict';text=globals.converter._dispatch("makehtml.paragraphs.before",text,options,globals).getText();// Strip leading and trailing lines:
text=text.replace(/^\n+/g,"");text=text.replace(/\n+$/g,"");// Wrap <p> tags
for(var grafs=text.split(/\n{2,}/g),grafsOut=[],end=grafs.length,i=0,str;i<end;i++){str=grafs[i];// if this is an HTML marker, copy it
if(0<=str.search(/¨(K|G)(\d+)\1/g)){grafsOut.push(str);// test for presence of characters to prevent empty lines being parsed
// as paragraphs (resulting in undesired extra empty paragraphs)
}else if(0<=str.search(/\S/)){str=showdown.subParser("makehtml.spanGamut")(str,options,globals);str=str.replace(/^([ \t]*)/g,"<p>");str+="</p>";grafsOut.push(str)}}/** Unhashify HTML blocks */end=grafsOut.length;for(i=0;i<end;i++){var blockText="",grafsOutIt=grafsOut[i],codeFlag=!1;// if this is a marker for an html block...
// use RegExp.test instead of string.search because of QML bug
while(/¨(K|G)(\d+)\1/.test(grafsOutIt)){var delim=RegExp.$1,num=RegExp.$2;if("K"===delim){blockText=globals.gHtmlBlocks[num]}else{// we need to check if ghBlock is a false positive
if(codeFlag){// use encoded version of all text
blockText=showdown.subParser("makehtml.encodeCode")(globals.ghCodeBlocks[num].text,options,globals)}else{blockText=globals.ghCodeBlocks[num].codeblock}}blockText=blockText.replace(/\$/g,"$$$$");// Escape any dollar signs
grafsOutIt=grafsOutIt.replace(/(\n\n)?¨(K|G)\d+\2(\n\n)?/,blockText);// Check if grafsOutIt is a pre->code
if(/^<pre\b[^>]*>\s*<code\b[^>]*>/.test(grafsOutIt)){codeFlag=!0}}grafsOut[i]=grafsOutIt}text=grafsOut.join("\n");// Strip leading and trailing lines:
text=text.replace(/^\n+/g,"");text=text.replace(/\n+$/g,"");return globals.converter._dispatch("makehtml.paragraphs.after",text,options,globals).getText()});/**
     * Run extension
     */showdown.subParser("makehtml.runExtension",function(ext,text,options,globals){'use strict';if(ext.filter){text=ext.filter(text,globals.converter,options)}else if(ext.regex){// TODO remove this when old extension loading mechanism is deprecated
var re=ext.regex;if(!(re instanceof RegExp)){re=new RegExp(re,"g")}text=text.replace(re,ext.replace)}return text});/**
     * These are all the transformations that occur *within* block-level
     * tags like paragraphs, headers, and list items.
     */showdown.subParser("makehtml.spanGamut",function(text,options,globals){'use strict';text=globals.converter._dispatch("makehtml.span.before",text,options,globals).getText();text=showdown.subParser("makehtml.codeSpans")(text,options,globals);text=showdown.subParser("makehtml.escapeSpecialCharsWithinTagAttributes")(text,options,globals);text=showdown.subParser("makehtml.encodeBackslashEscapes")(text,options,globals);// Process link and image tags. Images must come first,
// because ![foo][f] looks like a link.
text=showdown.subParser("makehtml.images")(text,options,globals);text=globals.converter._dispatch("smakehtml.links.before",text,options,globals).getText();text=showdown.subParser("makehtml.links")(text,options,globals);text=globals.converter._dispatch("smakehtml.links.after",text,options,globals).getText();//text = showdown.subParser('makehtml.autoLinks')(text, options, globals);
//text = showdown.subParser('makehtml.simplifiedAutoLinks')(text, options, globals);
text=showdown.subParser("makehtml.emoji")(text,options,globals);text=showdown.subParser("makehtml.underline")(text,options,globals);text=showdown.subParser("makehtml.italicsAndBold")(text,options,globals);text=showdown.subParser("makehtml.strikethrough")(text,options,globals);text=showdown.subParser("makehtml.ellipsis")(text,options,globals);// we need to hash HTML tags inside spans
text=showdown.subParser("makehtml.hashHTMLSpans")(text,options,globals);// now we encode amps and angles
text=showdown.subParser("makehtml.encodeAmpsAndAngles")(text,options,globals);// Do hard breaks
if(options.simpleLineBreaks){// GFM style hard breaks
// only add line breaks if the text does not contain a block (special case for lists)
if(!/\n\n¨K/.test(text)){text=text.replace(/\n+/g,"<br />\n")}}else{// Vanilla hard breaks
text=text.replace(/  +\n/g,"<br />\n")}text=globals.converter._dispatch("makehtml.spanGamut.after",text,options,globals).getText();return text});showdown.subParser("makehtml.strikethrough",function(text,options,globals){'use strict';if(options.strikethrough){text=globals.converter._dispatch("makehtml.strikethrough.before",text,options,globals).getText();text=text.replace(/(?:~){2}([\s\S]+?)(?:~){2}/g,function(wm,txt){return"<del>"+txt+"</del>"});text=globals.converter._dispatch("makehtml.strikethrough.after",text,options,globals).getText()}return text});/**
     * Strips link definitions from text, stores the URLs and titles in
     * hash references.
     * Link defs are in the form: ^[id]: url "optional title"
     */showdown.subParser("makehtml.stripLinkDefinitions",function(text,options,globals){'use strict';var regex=/^ {0,3}\[(.+)]:[ \t]*\n?[ \t]*<?([^>\s]+)>?(?: =([*\d]+[A-Za-z%]{0,4})x([*\d]+[A-Za-z%]{0,4}))?[ \t]*\n?[ \t]*(?:(\n*)["|'(](.+?)["|')][ \t]*)?(?:\n+|(?=¨0))/gm,base64Regex=/^ {0,3}\[(.+)]:[ \t]*\n?[ \t]*<?(data:.+?\/.+?;base64,[A-Za-z0-9+/=\n]+?)>?(?: =([*\d]+[A-Za-z%]{0,4})x([*\d]+[A-Za-z%]{0,4}))?[ \t]*\n?[ \t]*(?:(\n*)["|'(](.+?)["|')][ \t]*)?(?:\n\n|(?=¨0)|(?=\n\[))/gm;// attacklab: sentinel workarounds for lack of \A and \Z, safari\khtml bug
text+="\xA80";var replaceFunc=function(wholeMatch,linkId,url,width,height,blankLines,title){linkId=linkId.toLowerCase();if(url.match(/^data:.+?\/.+?;base64,/)){// remove newlines
globals.gUrls[linkId]=url.replace(/\s/g,"")}else{globals.gUrls[linkId]=showdown.subParser("makehtml.encodeAmpsAndAngles")(url,options,globals);// Link IDs are case-insensitive
}if(blankLines){// Oops, found blank lines, so it's not a title.
// Put back the parenthetical statement we stole.
return blankLines+title}else{if(title){globals.gTitles[linkId]=title.replace(/"|'/g,"&quot;")}if(options.parseImgDimensions&&width&&height){globals.gDimensions[linkId]={width:width,height:height}}}// Completely remove the definition from the text
return""};// first we try to find base64 link references
text=text.replace(base64Regex,replaceFunc);text=text.replace(regex,replaceFunc);// attacklab: strip sentinel
text=text.replace(/¨0/,"");return text});showdown.subParser("makehtml.tables",function(text,options,globals){'use strict';if(!options.tables){return text}var tableRgx=/^ {0,3}\|?.+\|.+\n {0,3}\|?[ \t]*:?[ \t]*(?:[-=]){2,}[ \t]*:?[ \t]*\|[ \t]*:?[ \t]*(?:[-=]){2,}[\s\S]+?(?:\n\n|¨0)/gm,//singeColTblRgx = /^ {0,3}\|.+\|\n {0,3}\|[ \t]*:?[ \t]*(?:[-=]){2,}[ \t]*:?[ \t]*\|[ \t]*\n(?: {0,3}\|.+\|\n)+(?:\n\n|¨0)/gm;
singeColTblRgx=/^ {0,3}\|.+\|[ \t]*\n {0,3}\|[ \t]*:?[ \t]*(?:[-=]){2,}[ \t]*:?[ \t]*\|[ \t]*\n( {0,3}\|.+\|[ \t]*\n)*(?:\n|¨0)/gm;function parseStyles(sLine){if(/^:[ \t]*--*$/.test(sLine)){return" style=\"text-align:left;\""}else if(/^--*[ \t]*:[ \t]*$/.test(sLine)){return" style=\"text-align:right;\""}else if(/^:[ \t]*--*[ \t]*:$/.test(sLine)){return" style=\"text-align:center;\""}else{return""}}function parseHeaders(header,style){var id="";header=header.trim();// support both tablesHeaderId and tableHeaderId due to error in documentation so we don't break backwards compatibility
if(options.tablesHeaderId||options.tableHeaderId){id=" id=\""+header.replace(/ /g,"_").toLowerCase()+"\""}header=showdown.subParser("makehtml.spanGamut")(header,options,globals);return"<th"+id+style+">"+header+"</th>\n"}function parseCells(cell,style){var subText=showdown.subParser("makehtml.spanGamut")(cell,options,globals);return"<td"+style+">"+subText+"</td>\n"}function buildTable(headers,cells){for(var tb="<table>\n<thead>\n<tr>\n",tblLgn=headers.length,i=0;i<tblLgn;++i){tb+=headers[i]}tb+="</tr>\n</thead>\n<tbody>\n";for(i=0;i<cells.length;++i){tb+="<tr>\n";for(var ii=0;ii<tblLgn;++ii){tb+=cells[i][ii]}tb+="</tr>\n"}tb+="</tbody>\n</table>\n";return tb}function parseTable(rawTable){var i,tableLines=rawTable.split("\n");for(i=0;i<tableLines.length;++i){// strip wrong first and last column if wrapped tables are used
if(/^ {0,3}\|/.test(tableLines[i])){tableLines[i]=tableLines[i].replace(/^ {0,3}\|/,"")}if(/\|[ \t]*$/.test(tableLines[i])){tableLines[i]=tableLines[i].replace(/\|[ \t]*$/,"")}// parse code spans first, but we only support one line code spans
tableLines[i]=showdown.subParser("makehtml.codeSpans")(tableLines[i],options,globals)}var rawHeaders=tableLines[0].split("|").map(function(s){return s.trim()}),rawStyles=tableLines[1].split("|").map(function(s){return s.trim()}),rawCells=[],headers=[],styles=[],cells=[];tableLines.shift();tableLines.shift();for(i=0;i<tableLines.length;++i){if(""===tableLines[i].trim()){continue}rawCells.push(tableLines[i].split("|").map(function(s){return s.trim()}))}if(rawHeaders.length<rawStyles.length){return rawTable}for(i=0;i<rawStyles.length;++i){styles.push(parseStyles(rawStyles[i]))}for(i=0;i<rawHeaders.length;++i){if(showdown.helper.isUndefined(styles[i])){styles[i]=""}headers.push(parseHeaders(rawHeaders[i],styles[i]))}for(i=0;i<rawCells.length;++i){for(var row=[],ii=0;ii<headers.length;++ii){if(showdown.helper.isUndefined(rawCells[i][ii])){}row.push(parseCells(rawCells[i][ii],styles[ii]))}cells.push(row)}return buildTable(headers,cells)}text=globals.converter._dispatch("makehtml.tables.before",text,options,globals).getText();// find escaped pipe characters
text=text.replace(/\\(\|)/g,showdown.helper.escapeCharactersCallback);// parse multi column tables
text=text.replace(tableRgx,parseTable);// parse one column tables
text=text.replace(singeColTblRgx,parseTable);text=globals.converter._dispatch("makehtml.tables.after",text,options,globals).getText();return text});showdown.subParser("makehtml.underline",function(text,options,globals){'use strict';if(!options.underline){return text}text=globals.converter._dispatch("makehtml.underline.before",text,options,globals).getText();if(options.literalMidWordUnderscores){text=text.replace(/\b___(\S[\s\S]*?)___\b/g,function(wm,txt){return"<u>"+txt+"</u>"});text=text.replace(/\b__(\S[\s\S]*?)__\b/g,function(wm,txt){return"<u>"+txt+"</u>"})}else{text=text.replace(/___(\S[\s\S]*?)___/g,function(wm,m){return /\S$/.test(m)?"<u>"+m+"</u>":wm});text=text.replace(/__(\S[\s\S]*?)__/g,function(wm,m){return /\S$/.test(m)?"<u>"+m+"</u>":wm})}// escape remaining underscores to prevent them being parsed by italic and bold
text=text.replace(/(_)/g,showdown.helper.escapeCharactersCallback);text=globals.converter._dispatch("makehtml.underline.after",text,options,globals).getText();return text});/**
     * Swap back in all the special characters we've hidden.
     */showdown.subParser("makehtml.unescapeSpecialChars",function(text,options,globals){'use strict';text=globals.converter._dispatch("makehtml.unescapeSpecialChars.before",text,options,globals).getText();text=text.replace(/¨E(\d+)E/g,function(wholeMatch,m1){var charCodeToReplace=parseInt(m1);return String.fromCharCode(charCodeToReplace)});text=globals.converter._dispatch("makehtml.unescapeSpecialChars.after",text,options,globals).getText();return text});showdown.subParser("makeMarkdown.blockquote",function(node,globals){'use strict';var txt="";if(node.hasChildNodes()){for(var children=node.childNodes,childrenLength=children.length,i=0,innerTxt;i<childrenLength;++i){innerTxt=showdown.subParser("makeMarkdown.node")(children[i],globals);if(""===innerTxt){continue}txt+=innerTxt}}// cleanup
txt=txt.trim();txt="> "+txt.split("\n").join("\n> ");return txt});showdown.subParser("makeMarkdown.codeBlock",function(node,globals){'use strict';var lang=node.getAttribute("language"),num=node.getAttribute("precodenum");return"```"+lang+"\n"+globals.preList[num]+"\n```"});showdown.subParser("makeMarkdown.codeSpan",function(node){'use strict';return"`"+node.innerHTML+"`"});showdown.subParser("makeMarkdown.emphasis",function(node,globals){'use strict';var txt="";if(node.hasChildNodes()){txt+="*";for(var children=node.childNodes,childrenLength=children.length,i=0;i<childrenLength;++i){txt+=showdown.subParser("makeMarkdown.node")(children[i],globals)}txt+="*"}return txt});showdown.subParser("makeMarkdown.header",function(node,globals,headerLevel){'use strict';var headerMark=Array(headerLevel+1).join("#"),txt="";if(node.hasChildNodes()){txt=headerMark+" ";for(var children=node.childNodes,childrenLength=children.length,i=0;i<childrenLength;++i){txt+=showdown.subParser("makeMarkdown.node")(children[i],globals)}}return txt});showdown.subParser("makeMarkdown.hr",function(){'use strict';return"---"});showdown.subParser("makeMarkdown.image",function(node){'use strict';var txt="";if(node.hasAttribute("src")){txt+="!["+node.getAttribute("alt")+"](";txt+="<"+node.getAttribute("src")+">";if(node.hasAttribute("width")&&node.hasAttribute("height")){txt+=" ="+node.getAttribute("width")+"x"+node.getAttribute("height")}if(node.hasAttribute("title")){txt+=" \""+node.getAttribute("title")+"\""}txt+=")"}return txt});showdown.subParser("makeMarkdown.links",function(node,globals){'use strict';var txt="";if(node.hasChildNodes()&&node.hasAttribute("href")){var children=node.childNodes,childrenLength=children.length;txt="[";for(var i=0;i<childrenLength;++i){txt+=showdown.subParser("makeMarkdown.node")(children[i],globals)}txt+="](";txt+="<"+node.getAttribute("href")+">";if(node.hasAttribute("title")){txt+=" \""+node.getAttribute("title")+"\""}txt+=")"}return txt});showdown.subParser("makeMarkdown.list",function(node,globals,type){'use strict';var txt="";if(!node.hasChildNodes()){return""}for(var listItems=node.childNodes,listItemsLenght=listItems.length,listNum=node.getAttribute("start")||1,i=0;i<listItemsLenght;++i){if("undefined"===typeof listItems[i].tagName||"li"!==listItems[i].tagName.toLowerCase()){continue}// define the bullet to use in list
var bullet="";if("ol"===type){bullet=listNum.toString()+". "}else{bullet="- "}// parse list item
txt+=bullet+showdown.subParser("makeMarkdown.listItem")(listItems[i],globals);++listNum}return txt.trim()});showdown.subParser("makeMarkdown.listItem",function(node,globals){'use strict';for(var listItemTxt="",children=node.childNodes,childrenLenght=children.length,i=0;i<childrenLenght;++i){listItemTxt+=showdown.subParser("makeMarkdown.node")(children[i],globals)}// if it's only one liner, we need to add a newline at the end
if(!/\n$/.test(listItemTxt)){listItemTxt+="\n"}else{// it's multiparagraph, so we need to indent
listItemTxt=listItemTxt.split("\n").join("\n    ").replace(/^ {4}$/gm,"").replace(/\n\n+/g,"\n\n")}return listItemTxt});showdown.subParser("makeMarkdown.node",function(node,globals,spansOnly){'use strict';spansOnly=spansOnly||!1;var txt="";// edge case of text without wrapper paragraph
if(3===node.nodeType){return showdown.subParser("makeMarkdown.txt")(node,globals)}// HTML comment
if(8===node.nodeType){return"<!--"+node.data+"-->\n\n"}// process only node elements
if(1!==node.nodeType){return""}var tagName=node.tagName.toLowerCase();switch(tagName){//
// BLOCKS
//
case"h1":if(!spansOnly){txt=showdown.subParser("makeMarkdown.header")(node,globals,1)+"\n\n"}break;case"h2":if(!spansOnly){txt=showdown.subParser("makeMarkdown.header")(node,globals,2)+"\n\n"}break;case"h3":if(!spansOnly){txt=showdown.subParser("makeMarkdown.header")(node,globals,3)+"\n\n"}break;case"h4":if(!spansOnly){txt=showdown.subParser("makeMarkdown.header")(node,globals,4)+"\n\n"}break;case"h5":if(!spansOnly){txt=showdown.subParser("makeMarkdown.header")(node,globals,5)+"\n\n"}break;case"h6":if(!spansOnly){txt=showdown.subParser("makeMarkdown.header")(node,globals,6)+"\n\n"}break;case"p":if(!spansOnly){txt=showdown.subParser("makeMarkdown.paragraph")(node,globals)+"\n\n"}break;case"blockquote":if(!spansOnly){txt=showdown.subParser("makeMarkdown.blockquote")(node,globals)+"\n\n"}break;case"hr":if(!spansOnly){txt=showdown.subParser("makeMarkdown.hr")(node,globals)+"\n\n"}break;case"ol":if(!spansOnly){txt=showdown.subParser("makeMarkdown.list")(node,globals,"ol")+"\n\n"}break;case"ul":if(!spansOnly){txt=showdown.subParser("makeMarkdown.list")(node,globals,"ul")+"\n\n"}break;case"precode":if(!spansOnly){txt=showdown.subParser("makeMarkdown.codeBlock")(node,globals)+"\n\n"}break;case"pre":if(!spansOnly){txt=showdown.subParser("makeMarkdown.pre")(node,globals)+"\n\n"}break;case"table":if(!spansOnly){txt=showdown.subParser("makeMarkdown.table")(node,globals)+"\n\n"}break;//
// SPANS
//
case"code":txt=showdown.subParser("makeMarkdown.codeSpan")(node,globals);break;case"em":case"i":txt=showdown.subParser("makeMarkdown.emphasis")(node,globals);break;case"strong":case"b":txt=showdown.subParser("makeMarkdown.strong")(node,globals);break;case"del":txt=showdown.subParser("makeMarkdown.strikethrough")(node,globals);break;case"a":txt=showdown.subParser("makeMarkdown.links")(node,globals);break;case"img":txt=showdown.subParser("makeMarkdown.image")(node,globals);break;default:txt=node.outerHTML+"\n\n";}// common normalization
// TODO eventually
return txt});showdown.subParser("makeMarkdown.paragraph",function(node,globals){'use strict';var txt="";if(node.hasChildNodes()){for(var children=node.childNodes,childrenLength=children.length,i=0;i<childrenLength;++i){txt+=showdown.subParser("makeMarkdown.node")(children[i],globals)}}// some text normalization
txt=txt.trim();return txt});showdown.subParser("makeMarkdown.pre",function(node,globals){'use strict';var num=node.getAttribute("prenum");return"<pre>"+globals.preList[num]+"</pre>"});showdown.subParser("makeMarkdown.strikethrough",function(node,globals){'use strict';var txt="";if(node.hasChildNodes()){txt+="~~";for(var children=node.childNodes,childrenLength=children.length,i=0;i<childrenLength;++i){txt+=showdown.subParser("makeMarkdown.node")(children[i],globals)}txt+="~~"}return txt});showdown.subParser("makeMarkdown.strong",function(node,globals){'use strict';var txt="";if(node.hasChildNodes()){txt+="**";for(var children=node.childNodes,childrenLength=children.length,i=0;i<childrenLength;++i){txt+=showdown.subParser("makeMarkdown.node")(children[i],globals)}txt+="**"}return txt});showdown.subParser("makeMarkdown.table",function(node,globals){'use strict';var txt="",tableArray=[[],[]],headings=node.querySelectorAll("thead>tr>th"),rows=node.querySelectorAll("tbody>tr"),i,ii;for(i=0;i<headings.length;++i){var headContent=showdown.subParser("makeMarkdown.tableCell")(headings[i],globals),allign="---";if(headings[i].hasAttribute("style")){var style=headings[i].getAttribute("style").toLowerCase().replace(/\s/g,"");switch(style){case"text-align:left;":allign=":---";break;case"text-align:right;":allign="---:";break;case"text-align:center;":allign=":---:";break;}}tableArray[0][i]=headContent.trim();tableArray[1][i]=allign}for(i=0;i<rows.length;++i){var r=tableArray.push([])-1,cols=rows[i].getElementsByTagName("td");for(ii=0;ii<headings.length;++ii){var cellContent=" ";if("undefined"!==typeof cols[ii]){cellContent=showdown.subParser("makeMarkdown.tableCell")(cols[ii],globals)}tableArray[r].push(cellContent)}}var cellSpacesCount=3;for(i=0;i<tableArray.length;++i){for(ii=0;ii<tableArray[i].length;++ii){var strLen=tableArray[i][ii].length;if(strLen>cellSpacesCount){cellSpacesCount=strLen}}}for(i=0;i<tableArray.length;++i){for(ii=0;ii<tableArray[i].length;++ii){if(1===i){if(":"===tableArray[i][ii].slice(-1)){tableArray[i][ii]=showdown.helper.padEnd(tableArray[i][ii].slice(-1),cellSpacesCount-1,"-")+":"}else{tableArray[i][ii]=showdown.helper.padEnd(tableArray[i][ii],cellSpacesCount,"-")}}else{tableArray[i][ii]=showdown.helper.padEnd(tableArray[i][ii],cellSpacesCount)}}txt+="| "+tableArray[i].join(" | ")+" |\n"}return txt.trim()});showdown.subParser("makeMarkdown.tableCell",function(node,globals){'use strict';var txt="";if(!node.hasChildNodes()){return""}for(var children=node.childNodes,childrenLength=children.length,i=0;i<childrenLength;++i){txt+=showdown.subParser("makeMarkdown.node")(children[i],globals,!0)}return txt.trim()});showdown.subParser("makeMarkdown.txt",function(node){'use strict';var txt=node.nodeValue;// multiple spaces are collapsed
txt=txt.replace(/ +/g," ");// replace the custom ¨NBSP; with a space
txt=txt.replace(/¨NBSP;/g," ");// ", <, > and & should replace escaped html entities
txt=showdown.helper.unescapeHTMLEntities(txt);// escape markdown magic characters
// emphasis, strong and strikethrough - can appear everywhere
// we also escape pipe (|) because of tables
// and escape ` because of code blocks and spans
txt=txt.replace(/([*_~|`])/g,"\\$1");// escape > because of blockquotes
txt=txt.replace(/^(\s*)>/g,"\\$1>");// hash character, only troublesome at the beginning of a line because of headers
txt=txt.replace(/^#/gm,"\\#");// horizontal rules
txt=txt.replace(/^(\s*)([-=]{3,})(\s*)$/,"$1\\$2$3");// dot, because of ordered lists, only troublesome at the beginning of a line when preceded by an integer
txt=txt.replace(/^( {0,3}\d+)\./gm,"$1\\.");// +, * and -, at the beginning of a line becomes a list, so we need to escape them also (asterisk was already escaped)
txt=txt.replace(/^( {0,3})([+-])/gm,"$1\\$2");// images and links, ] followed by ( is problematic, so we escape it
txt=txt.replace(/]([\s]*)\(/g,"\\]$1\\(");// reference URIs must also be escaped
txt=txt.replace(/^ {0,3}\[([\S \t]*?)]:/gm,"\\[$1]:");return txt});/**
     * Created by Estevao on 31-05-2015.
     */ /**
         * Showdown Converter class
         * @class
         * @param {object} [converterOptions]
         * @returns {Converter}
         */showdown.Converter=function(converterOptions){'use strict';var/**
       * Options used by this converter
       * @private
       * @type {{}}
       */options={},/**
       * Language extensions used by this converter
       * @private
       * @type {Array}
       */langExtensions=[],/**
       * Output modifiers extensions used by this converter
       * @private
       * @type {Array}
       */outputModifiers=[],/**
       * Event listeners
       * @private
       * @type {{}}
       */listeners={},/**
       * The flavor set in this converter
       */setConvFlavor=setFlavor,/**
       * Metadata of the document
       * @type {{parsed: {}, raw: string, format: string}}
       */metadata={parsed:{},raw:"",format:""};_constructor();/**
                   * Converter constructor
                   * @private
                   */function _constructor(){converterOptions=converterOptions||{};for(var gOpt in globalOptions){if(globalOptions.hasOwnProperty(gOpt)){options[gOpt]=globalOptions[gOpt]}}// Merge options
if("object"===typeof converterOptions){for(var opt in converterOptions){if(converterOptions.hasOwnProperty(opt)){options[opt]=converterOptions[opt]}}}else{throw Error("Converter expects the passed parameter to be an object, but "+typeof converterOptions+" was passed instead.")}if(options.extensions){showdown.helper.forEach(options.extensions,_parseExtension)}}/**
     * Parse extension
     * @param {*} ext
     * @param {string} [name='']
     * @private
     */function _parseExtension(ext,name){name=name||null;// If it's a string, the extension was previously loaded
if(showdown.helper.isString(ext)){ext=showdown.helper.stdExtName(ext);name=ext;// LEGACY_SUPPORT CODE
if(showdown.extensions[ext]){console.warn("DEPRECATION WARNING: "+ext+" is an old extension that uses a deprecated loading method."+"Please inform the developer that the extension should be updated!");legacyExtensionLoading(showdown.extensions[ext],ext);return;// END LEGACY SUPPORT CODE
}else if(!showdown.helper.isUndefined(extensions[ext])){ext=extensions[ext]}else{throw Error("Extension \""+ext+"\" could not be loaded. It was either not found or is not a valid extension.")}}if("function"===typeof ext){ext=ext()}if(!showdown.helper.isArray(ext)){ext=[ext]}var validExt=validate(ext,name);if(!validExt.valid){throw Error(validExt.error)}for(var i=0;i<ext.length;++i){switch(ext[i].type){case"lang":langExtensions.push(ext[i]);break;case"output":outputModifiers.push(ext[i]);break;}if(ext[i].hasOwnProperty("listeners")){for(var ln in ext[i].listeners){if(ext[i].listeners.hasOwnProperty(ln)){listen(ln,ext[i].listeners[ln])}}}}}/**
     * LEGACY_SUPPORT
     * @param {*} ext
     * @param {string} name
     */function legacyExtensionLoading(ext,name){if("function"===typeof ext){ext=ext(new showdown.Converter)}if(!showdown.helper.isArray(ext)){ext=[ext]}var valid=validate(ext,name);if(!valid.valid){throw Error(valid.error)}for(var i=0;i<ext.length;++i){switch(ext[i].type){case"lang":langExtensions.push(ext[i]);break;case"output":outputModifiers.push(ext[i]);break;default:// should never reach here
throw Error("Extension loader error: Type unrecognized!!!");}}}/**
     * Listen to an event
     * @param {string} name
     * @param {function} callback
     */function listen(name,callback){if(!showdown.helper.isString(name)){throw Error("Invalid argument in converter.listen() method: name must be a string, but "+typeof name+" given")}if("function"!==typeof callback){throw Error("Invalid argument in converter.listen() method: callback must be a function, but "+typeof callback+" given")}name=name.toLowerCase();if(!listeners.hasOwnProperty(name)){listeners[name]=[]}listeners[name].push(callback)}function rTrimInputText(text){var rsp=text.match(/^\s*/)[0].length,rgx=new RegExp("^\\s{0,"+rsp+"}","gm");return text.replace(rgx,"")}/**
     *
     * @param {string} evtName Event name
     * @param {string} text Text
     * @param {{}} options Converter Options
     * @param {{}} globals Converter globals
     * @param {{}} pParams extra params for event
     * @returns showdown.helper.Event
     * @private
     */this._dispatch=function dispatch(evtName,text,options,globals,pParams){evtName=evtName.toLowerCase();var params=pParams||{};params.converter=this;params.text=text;params.options=options;params.globals=globals;var event=new showdown.helper.Event(evtName,text,params);if(listeners.hasOwnProperty(evtName)){for(var ei=0,nText;ei<listeners[evtName].length;++ei){nText=listeners[evtName][ei](event);if(nText&&"undefined"!==typeof nText){event.setText(nText)}}}return event};/**
      * Listen to an event
      * @param {string} name
      * @param {function} callback
      * @returns {showdown.Converter}
      */this.listen=function(name,callback){listen(name,callback);return this};/**
      * Converts a markdown string into HTML string
      * @param {string} text
      * @returns {*}
      */this.makeHtml=function(text){//check if text is not falsy
if(!text){return text}var globals={gHtmlBlocks:[],gHtmlMdBlocks:[],gHtmlSpans:[],gUrls:{},gTitles:{},gDimensions:{},gListLevel:0,hashLinkCounts:{},langExtensions:langExtensions,outputModifiers:outputModifiers,converter:this,ghCodeBlocks:[],metadata:{parsed:{},raw:"",format:""}};// This lets us use ¨ trema as an escape char to avoid md5 hashes
// The choice of character is arbitrary; anything that isn't
// magic in Markdown will work.
text=text.replace(/¨/g,"\xA8T");// Replace $ with ¨D
// RegExp interprets $ as a special character
// when it's in a replacement string
text=text.replace(/\$/g,"\xA8D");// Standardize line endings
text=text.replace(/\r\n/g,"\n");// DOS to Unix
text=text.replace(/\r/g,"\n");// Mac to Unix
// Stardardize line spaces
text=text.replace(/\u00A0/g,"&nbsp;");if(options.smartIndentationFix){text=rTrimInputText(text)}// Make sure text begins and ends with a couple of newlines:
text="\n\n"+text+"\n\n";// detab
text=showdown.subParser("makehtml.detab")(text,options,globals);/**
                                                                          * Strip any lines consisting only of spaces and tabs.
                                                                          * This makes subsequent regexs easier to write, because we can
                                                                          * match consecutive blank lines with /\n+/ instead of something
                                                                          * contorted like /[ \t]*\n+/
                                                                          */text=text.replace(/^[ \t]+$/mg,"");//run languageExtensions
showdown.helper.forEach(langExtensions,function(ext){text=showdown.subParser("makehtml.runExtension")(ext,text,options,globals)});// run the sub parsers
text=showdown.subParser("makehtml.metadata")(text,options,globals);text=showdown.subParser("makehtml.hashPreCodeTags")(text,options,globals);text=showdown.subParser("makehtml.githubCodeBlocks")(text,options,globals);text=showdown.subParser("makehtml.hashHTMLBlocks")(text,options,globals);text=showdown.subParser("makehtml.hashCodeTags")(text,options,globals);text=showdown.subParser("makehtml.stripLinkDefinitions")(text,options,globals);text=showdown.subParser("makehtml.blockGamut")(text,options,globals);text=showdown.subParser("makehtml.unhashHTMLSpans")(text,options,globals);text=showdown.subParser("makehtml.unescapeSpecialChars")(text,options,globals);// attacklab: Restore dollar signs
text=text.replace(/¨D/g,"$$");// attacklab: Restore tremas
text=text.replace(/¨T/g,"\xA8");// render a complete html document instead of a partial if the option is enabled
text=showdown.subParser("makehtml.completeHTMLDocument")(text,options,globals);// Run output modifiers
showdown.helper.forEach(outputModifiers,function(ext){text=showdown.subParser("makehtml.runExtension")(ext,text,options,globals)});// update metadata
metadata=globals.metadata;return text};/**
      * Converts an HTML string into a markdown string
      * @param src
      * @returns {string}
      */this.makeMarkdown=function(src){// replace \r\n with \n
src=src.replace(/\r\n/g,"\n");src=src.replace(/\r/g,"\n");// old macs
// due to an edge case, we need to find this: > <
// to prevent removing of non silent white spaces
// ex: <em>this is</em> <strong>sparta</strong>
src=src.replace(/>[ \t]+</,">\xA8NBSP;<");var doc=showdown.helper.document.createElement("div");doc.innerHTML=src;var globals={preList:substitutePreCodeTags(doc)};// remove all newlines and collapse spaces
clean(doc);// some stuff, like accidental reference links must now be escaped
// TODO
// doc.innerHTML = doc.innerHTML.replace(/\[[\S\t ]]/);
for(var nodes=doc.childNodes,mdDoc="",i=0;i<nodes.length;i++){mdDoc+=showdown.subParser("makeMarkdown.node")(nodes[i],globals)}function clean(node){for(var n=0,child;n<node.childNodes.length;++n){child=node.childNodes[n];if(3===child.nodeType){if(!/\S/.test(child.nodeValue)){node.removeChild(child);--n}else{child.nodeValue=child.nodeValue.split("\n").join(" ");child.nodeValue=child.nodeValue.replace(/(\s)+/g,"$1")}}else if(1===child.nodeType){clean(child)}}}// find all pre tags and replace contents with placeholder
// we need this so that we can remove all indentation from html
// to ease up parsing
function substitutePreCodeTags(doc){for(var pres=doc.querySelectorAll("pre"),presPH=[],i=0;i<pres.length;++i){if(1===pres[i].childElementCount&&"code"===pres[i].firstChild.tagName.toLowerCase()){var content=pres[i].firstChild.innerHTML.trim(),language=pres[i].firstChild.getAttribute("data-language")||"";// if data-language attribute is not defined, then we look for class language-*
if(""===language){for(var classes=pres[i].firstChild.className.split(" "),c=0,matches;c<classes.length;++c){matches=classes[c].match(/^language-(.+)$/);if(null!==matches){language=matches[1];break}}}// unescape html entities in content
content=showdown.helper.unescapeHTMLEntities(content);presPH.push(content);pres[i].outerHTML="<precode language=\""+language+"\" precodenum=\""+i.toString()+"\"></precode>"}else{presPH.push(pres[i].innerHTML);pres[i].innerHTML="";pres[i].setAttribute("prenum",i.toString())}}return presPH}return mdDoc};/**
      * Set an option of this Converter instance
      * @param {string} key
      * @param {*} value
      */this.setOption=function(key,value){options[key]=value};/**
      * Get the option of this Converter instance
      * @param {string} key
      * @returns {*}
      */this.getOption=function(key){return options[key]};/**
      * Get the options of this Converter instance
      * @returns {{}}
      */this.getOptions=function(){return options};/**
      * Add extension to THIS converter
      * @param {{}} extension
      * @param {string} [name=null]
      */this.addExtension=function(extension,name){name=name||null;_parseExtension(extension,name)};/**
      * Use a global registered extension with THIS converter
      * @param {string} extensionName Name of the previously registered extension
      */this.useExtension=function(extensionName){_parseExtension(extensionName)};/**
      * Set the flavor THIS converter should use
      * @param {string} name
      */this.setFlavor=function(name){if(!flavor.hasOwnProperty(name)){throw Error(name+" flavor was not found")}var preset=flavor[name];setConvFlavor=name;for(var option in preset){if(preset.hasOwnProperty(option)){options[option]=preset[option]}}};/**
      * Get the currently set flavor of this converter
      * @returns {string}
      */this.getFlavor=function(){return setConvFlavor};/**
      * Remove an extension from THIS converter.
      * Note: This is a costly operation. It's better to initialize a new converter
      * and specify the extensions you wish to use
      * @param {Array} extension
      */this.removeExtension=function(extension){if(!showdown.helper.isArray(extension)){extension=[extension]}for(var a=0,ext;a<extension.length;++a){ext=extension[a];for(var i=0;i<langExtensions.length;++i){if(langExtensions[i]===ext){langExtensions[i].splice(i,1)}}for(var ii=0;ii<outputModifiers.length;++i){if(outputModifiers[ii]===ext){outputModifiers[ii].splice(i,1)}}}};/**
      * Get all extension of THIS converter
      * @returns {{language: Array, output: Array}}
      */this.getAllExtensions=function(){return{language:langExtensions,output:outputModifiers}};/**
      * Get the metadata of the previously parsed document
      * @param raw
      * @returns {string|{}}
      */this.getMetadata=function(raw){if(raw){return metadata.raw}else{return metadata.parsed}};/**
      * Get the metadata format of the previously parsed document
      * @returns {string}
      */this.getMetadataFormat=function(){return metadata.format};/**
      * Private: set a single key, value metadata pair
      * @param {string} key
      * @param {string} value
      */this._setMetadataPair=function(key,value){metadata.parsed[key]=value};/**
      * Private: set metadata format
      * @param {string} format
      */this._setMetadataFormat=function(format){metadata.format=format};/**
      * Private: set metadata raw text
      * @param {string} raw
      */this._setMetadataRaw=function(raw){metadata.raw=raw}};var showdown$1={default:showdown},__decorate$1=void 0||function(decorators,target,key,desc){var c=arguments.length,r=3>c?target:null===desc?desc=Object.getOwnPropertyDescriptor(target,key):desc,d;if("object"===typeof Reflect&&"function"===typeof Reflect.decorate)r=Reflect.decorate(decorators,target,key,desc);else for(var i=decorators.length-1;0<=i;i--)if(d=decorators[i])r=(3>c?d(r):3<c?d(target,key,r):d(target,key))||r;return 3<c&&r&&Object.defineProperty(target,key,r),r};const converter=new showdown.Converter;let Pho3nixMarkdown=class Pho3nixMarkdown extends LitElement{constructor(){super(...arguments);this.fetchedMarkdown=["",""];this.fetchedTheme=["",""];this.renderedMarkdown=html``;this.renderedTheme=html``;this.sticky=!1;this.src="";this.theme=""}async fetchMarkdown(src){if(src){const md=await fetch(src).then(async response=>await response.text()).catch(()=>"");if(md)this.fetchedMarkdown=[src,md];return md||this.fetchedMarkdown[1]}this.fetchedMarkdown=[src,""];return""}async fetchTheme(src){if(src){const css=await fetch(src).then(async response=>await response.text()).catch(()=>"");if(css)this.fetchedTheme=[src,css];return css||this.fetchedTheme[1]}this.fetchedTheme=[src,""];return""}async fetchAndConvertMarkdown(src,theme){const isSameMd=src===this.fetchedMarkdown[0],isSameTheme=theme===this.fetchedTheme[0],[md,style]=await Promise.all([this.fetchMarkdown(src),this.fetchTheme(theme||"")]);if(!isSameMd){this.renderedMarkdown=html`${unsafeHTML(converter.makeHtml(md))}`}if(!isSameTheme){this.renderedTheme=html`<style>${style}</style>`}return html`${this.renderedTheme}${this.renderedMarkdown}`}static get styles(){return[css`
        :host {
          display: block;
          color: white;
        }
        img {
          display: block;
          margin: auto;

          height: auto;
          max-height: 100%;

          width: auto;
          max-width: 100%;
        }
      `]}renderSpinner(){return html`
    <style>
      pho3nix-spinner {
        --ripple-size: 128px;
        --ripple-color: #fff;
        --ripple-style: solid;
      }
    </style>
    <pho3nix-spinner></pho3nix-spinner>
    `}render(){const md=this.fetchAndConvertMarkdown(this.src,this.theme);return html`${until(md,this.renderSpinner())}`}};__decorate$1([property({type:Boolean,reflect:!0,attribute:!0})],Pho3nixMarkdown.prototype,"sticky",void 0);__decorate$1([property({type:String,reflect:!0,attribute:!0})],Pho3nixMarkdown.prototype,"src",void 0);__decorate$1([property({type:String,reflect:!0,attribute:!0})],Pho3nixMarkdown.prototype,"theme",void 0);Pho3nixMarkdown=__decorate$1([customElement("pho3nix-markdown")],Pho3nixMarkdown);var pho3nixMarkdown={get Pho3nixMarkdown(){return Pho3nixMarkdown}};export{cssTag as $cssTag,cssTag$1 as $cssTag$1,decorators as $decorators,decorators$1 as $decorators$1,defaultTemplateProcessor$1 as $defaultTemplateProcessor,defaultTemplateProcessor$1$1 as $defaultTemplateProcessor$1,directive$1 as $directive,directive$1$1 as $directive$1,dom as $dom,dom$1 as $dom$1,litElement as $litElement,litElement$1 as $litElement$1,litHtml as $litHtml,litHtml$1 as $litHtml$1,modifyTemplate as $modifyTemplate,modifyTemplate$1 as $modifyTemplate$1,part as $part,part$1 as $part$1,parts as $parts,parts$2 as $parts$1,pho3nixMarkdown as $pho3nixMarkdown,pho3nixSpinner$1 as $pho3nixSpinner,pho3nixSpinner as $pho3nixSpinner$1,render$1 as $render,render$1$1 as $render$1,shadyRender as $shadyRender,shadyRender$1 as $shadyRender$1,showdown$1 as $showdown,showdown as $showdownDefault,template as $template,template$1 as $template$1,templateFactory$1 as $templateFactory,templateFactory$1$1 as $templateFactory$1,templateInstance as $templateInstance,templateInstance$1 as $templateInstance$1,templateResult as $templateResult,templateResult$1 as $templateResult$1,unsafeHtml as $unsafeHtml,until$1 as $until,updatingElement as $updatingElement,updatingElement$1 as $updatingElement$1,AttributeCommitter,AttributeCommitter as AttributeCommitter$1,AttributeCommitter$1 as AttributeCommitter$2,AttributeCommitter$1 as AttributeCommitter$3,AttributePart,AttributePart as AttributePart$1,AttributePart$1 as AttributePart$2,AttributePart$1 as AttributePart$3,BooleanAttributePart,BooleanAttributePart as BooleanAttributePart$1,BooleanAttributePart$1 as BooleanAttributePart$2,BooleanAttributePart$1 as BooleanAttributePart$3,CSSResult,CSSResult as CSSResult$1,CSSResult$1 as CSSResult$2,CSSResult$1 as CSSResult$3,DefaultTemplateProcessor,DefaultTemplateProcessor as DefaultTemplateProcessor$1,DefaultTemplateProcessor$1 as DefaultTemplateProcessor$2,DefaultTemplateProcessor$1 as DefaultTemplateProcessor$3,EventPart,EventPart as EventPart$1,EventPart$1 as EventPart$2,EventPart$1 as EventPart$3,LitElement,LitElement$1,NodePart,NodePart as NodePart$1,NodePart$1 as NodePart$2,NodePart$1 as NodePart$3,Pho3nixMarkdown,Pho3nixSpinner,PropertyCommitter,PropertyCommitter as PropertyCommitter$1,PropertyCommitter$1 as PropertyCommitter$2,PropertyCommitter$1 as PropertyCommitter$3,PropertyPart,PropertyPart as PropertyPart$1,PropertyPart$1 as PropertyPart$2,PropertyPart$1 as PropertyPart$3,SVGTemplateResult,SVGTemplateResult as SVGTemplateResult$1,SVGTemplateResult as SVGTemplateResult$2,SVGTemplateResult$1 as SVGTemplateResult$3,SVGTemplateResult$1 as SVGTemplateResult$4,SVGTemplateResult$1 as SVGTemplateResult$5,Template,Template as Template$1,Template$1 as Template$2,Template$1 as Template$3,TemplateInstance,TemplateInstance as TemplateInstance$1,TemplateInstance$1 as TemplateInstance$2,TemplateInstance$1 as TemplateInstance$3,TemplateResult,TemplateResult as TemplateResult$1,TemplateResult as TemplateResult$2,TemplateResult as TemplateResult$3,TemplateResult$1 as TemplateResult$4,TemplateResult$1 as TemplateResult$5,TemplateResult$1 as TemplateResult$6,TemplateResult$1 as TemplateResult$7,UpdatingElement,UpdatingElement as UpdatingElement$1,UpdatingElement$1 as UpdatingElement$2,UpdatingElement$1 as UpdatingElement$3,boundAttributeSuffix,boundAttributeSuffix$1,createMarker,createMarker as createMarker$1,createMarker$1 as createMarker$2,createMarker$1 as createMarker$3,css,css as css$1,css$1 as css$2,css$1 as css$3,customElement,customElement as customElement$1,customElement$1 as customElement$2,customElement$1 as customElement$3,defaultConverter,defaultConverter as defaultConverter$1,defaultConverter$1 as defaultConverter$2,defaultConverter$1 as defaultConverter$3,defaultTemplateProcessor,defaultTemplateProcessor as defaultTemplateProcessor$1,defaultTemplateProcessor$2,defaultTemplateProcessor$2 as defaultTemplateProcessor$3,directive,directive as directive$1,directive$2,directive$2 as directive$3,eventOptions,eventOptions as eventOptions$1,eventOptions$1 as eventOptions$2,eventOptions$1 as eventOptions$3,html,html as html$1,html as html$2,html$1 as html$3,html$1 as html$4,html$1 as html$5,insertNodeIntoTemplate,insertNodeIntoTemplate$1,isCEPolyfill,isCEPolyfill$1,isDirective,isDirective as isDirective$1,isDirective$1 as isDirective$2,isDirective$1 as isDirective$3,isIterable,isIterable as isIterable$1,isIterable$1 as isIterable$2,isIterable$1 as isIterable$3,isPrimitive,isPrimitive as isPrimitive$1,isPrimitive$1 as isPrimitive$2,isPrimitive$1 as isPrimitive$3,isTemplatePartActive,isTemplatePartActive as isTemplatePartActive$1,isTemplatePartActive$1 as isTemplatePartActive$2,isTemplatePartActive$1 as isTemplatePartActive$3,lastAttributeNameRegex,lastAttributeNameRegex$1,marker,marker$1,markerRegex,markerRegex$1,noChange,noChange as noChange$1,noChange$1 as noChange$2,noChange$1 as noChange$3,nodeMarker,nodeMarker$1,notEqual,notEqual as notEqual$1,notEqual$1 as notEqual$2,notEqual$1 as notEqual$3,nothing,nothing as nothing$1,nothing$1 as nothing$2,nothing$1 as nothing$3,parts$1 as parts,parts$1,parts$1$1 as parts$2,parts$1$1 as parts$3,property,property as property$1,property$1 as property$2,property$1 as property$3,query,query as query$1,query$1 as query$2,query$1 as query$3,queryAll,queryAll as queryAll$1,queryAll$1 as queryAll$2,queryAll$1 as queryAll$3,removeNodes,removeNodes as removeNodes$1,removeNodes$1 as removeNodes$2,removeNodes$1 as removeNodes$3,removeNodesFromTemplate,removeNodesFromTemplate$1,render,render$2 as render$1,render as render$2,render$3,render$2$1 as render$4,render$3 as render$5,reparentNodes,reparentNodes as reparentNodes$1,reparentNodes$1 as reparentNodes$2,reparentNodes$1 as reparentNodes$3,supportsAdoptingStyleSheets,supportsAdoptingStyleSheets as supportsAdoptingStyleSheets$1,supportsAdoptingStyleSheets$1 as supportsAdoptingStyleSheets$2,supportsAdoptingStyleSheets$1 as supportsAdoptingStyleSheets$3,svg,svg as svg$1,svg as svg$2,svg$1 as svg$3,svg$1 as svg$4,svg$1 as svg$5,templateCaches,templateCaches as templateCaches$1,templateCaches$1 as templateCaches$2,templateCaches$1 as templateCaches$3,templateFactory,templateFactory as templateFactory$1,templateFactory$2,templateFactory$2 as templateFactory$3,unsafeCSS,unsafeCSS as unsafeCSS$1,unsafeCSS$1 as unsafeCSS$2,unsafeCSS$1 as unsafeCSS$3,unsafeHTML,until};