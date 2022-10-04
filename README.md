# be-let [TODO]

*be-let* is a [be-decorated](https://github.com/bahrus/be-decorated) HTML element behavior / decorator.

*be-let* provides a [light](https://www.wordsense.eu/let/#Danish)-[weight](https://developer.mozilla.org/en-US/docs/Web/API/Worklet) way of turning a section of HTML into tiny unnamed islands of interactivity.  As with all be-decorated element behaviors, when the attribute be-let is applied to an HTML element, the attribute switches to "is-let" after upgrading.  So we end up with lots of is-lets (get it?).

To work with a be-let, developers can create reusable "scriptlets" similar in concept to this [stranded technology](https://learn.microsoft.com/en-us/previous-versions/office/developer/office2000/aa189871(v=office.10)?redirectedfrom=MSDN). Then, as time permits, it should be easy to formalize the scriptlet into an element decorator / behavior or even a web component should the needs arise (solidifying requirements, reusable), and let go of the be-let. 

It's also kind of like jquery via script tags (but admittedly a little more verbose).

Perhaps the most frequent use case would be in doing the following:

1.  Creating a shared "scope" object that everyone can subscribe to (if another be-let hasn't gotten there first).
2.  Adding a little, 2 or 3 line "behavior" to the elements that match some css query.
3.  The most common behavior the scriptlet would provide is transferring information from elements the user interacts with to the shared scope object, maybe after doing a back-end lookup.
    I.e. "let" scope.fetchResults = [result of some fetch]

In what follows, we will basically be working with that use case, but there's nothing tying down be-let from going beyond this use case. 

## Example 1

```html
  <div itemscope itemtype="https://schema.org/Movie">
      <h1 itemprop="name">Avatar</h1>
      <span>Director: <span itemprop="director">James Cameron</span> (born August 16,
          1954)</span>
      <span itemprop="genre">Science fiction</span>
      <a href="https://youtu.be/0AY1XIkX7bY" itemprop="trailer">Trailer</a>
  </div>
  <script nomodule be-let=[itemprop]>
      console.log(scope, target, added);
  </script>
```

This results in the four elements with attribute itemprop getting logged to the console.  It will create a shared scope object associated with the div element (empty in this example, if there are no other adjacent be-let's doing some its thing.)


## Example 2

```html
<div itemscope itemtype="https://schema.org/Movie">
  <h1 itemprop="name">Avatar</h1>
  <span>Director: <span itemprop="director">James Cameron</span> (born August 16,
    1954)</span>
  <span itemprop="genre">Science fiction</span>
  <a href="https://youtu.be/0AY1XIkX7bY" itemprop="trailer">Trailer</a>
</div>
<script nomodule be-let=itempropAttrs>
    target.contentEditable = true;
    scope[value] = ('href' in target) ? target.href : target.textContent;
</script>
```

scope is an ES6 proxy / Event target that is associated with the div element.  Can have multiple be-let / is-let script tags attached to the same div element, and the scope proxy is shared between them.  Unlike AngularJS, no inheritance of scope.  But might be possible to get some compositional chain, will see.  Anyway, scope ends up with value:

```JavaScript
{
    name: 'Avatar'
    director: 'James Cameron',
    genre: 'Science fiction',
    trailer: 'https://youtu.be/0AY1XIkX7bY'
}
```


It is shorthand for:

```html
<script nomodule be-exporting be-let='{
    "beScoping": ["upSearch", ":not(script)"],
    "for": "itempropAttrs",
}'>
  export const Scriptlet = class {
    async do ({target, added, value, scope}) => {
      target.contentEditable = added;
      scope[value] = ('href' in target) ? target.href : target.textContent;
    }
    
  }
</script>
```

## Example 3:  [TODO]

```html
<div itemscope itemtype="https://schema.org/Movie">
  <h1 itemprop="name">Avatar</h1>
  <span>Director: <span itemprop="director">James Cameron</span> (born August 16,
    1954)</span>
  <span itemprop="genre">Science fiction</span>
  <a href="https://youtu.be/0AY1XIkX7bY" itemprop="trailer">Trailer</a>
</div>
<script nomodule be-let=itempropAttrs>
  [
    {value: ('href' in target) ? target.href : target.textContent},
    {contentEditable: true}
  ]
</script>
```

Why?  

1.  If updating lots of things, the verbosity slightly slower.  
2.  When writing out the explicit class in a separate js file, can be more library neutral / easier to test.
3.  At least in this case, the target transform could become a JSON property of the be-let attribute (basically make it a transform on self).

## Example 4: [TODO]

Often times we need to do something on initialization, and then the same thing anytime an event is fired.  be-let can help with this scenario:

```html
<script nomodule be-let='{
  "for": "itempropAs",
  "on": "input",
}'>
    scope[value] = ('href' in target) === 'a' ? target.href : target.textContent;
</script>
```

shorthand for 

```html
<script nomodule be-exporting be-let='{
  "beScoping": ["upSearch", ":not(script)"],
  "for": "contenteditableAs"
}'>
  export const Scriptlet = class{
    #abortController = new AbortController;
    async init(ctx){
        if(added){
            target.addEventListener('input', e => {
                this.do(ctx);
            }, {signal: this.#abortController.signal})
        }else{
            this.#abortController.abort();
        }
    };

    async do ({target, added, value, scope}) => {
      scope[value] = added ? 
                  ('href' in target) ? target.href : target.textContent
                : undefined;
    }

    async dispose(){
      this.#abortController.abort();
    }
  }

</script>
```






