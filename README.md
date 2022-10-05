# be-let [TODO]

*be-let* is a [be-decorated](https://github.com/bahrus/be-decorated) HTML element behavior / decorator.

*be-let* provides a [light](https://www.wordsense.eu/let/#Danish)-[weight](https://developer.mozilla.org/en-US/docs/Web/API/Worklet) way of turning a section of HTML into tiny unnamed islands of interactivity.  As with all be-decorated element behaviors, when the attribute "be-let" is applied to an HTML element, the attribute switches to "is-let" after upgrading.  So we end up with lots of is-lets (get it?).

To work with a be-let, developers can create reusable "scriptlets" similar in concept to this [stranded technology](https://learn.microsoft.com/en-us/previous-versions/office/developer/office2000/aa189871(v=office.10)?redirectedfrom=MSDN). Then, as time permits, it should be easy to formalize the scriptlet into an element decorator / behavior or even a web component should the needs arise (solidifying requirements, reusable), and let go of the be-let. 

It's also kind of like jquery via script tags (but admittedly a little more verbose).

Perhaps the most frequent use case would be in doing the following:

1.  Automatically creating a shared "scope" object that everyone can subscribe to (if another be-let hasn't gotten there first).
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
      console.log(scope, target, ctx, added);
  </script>
```

This results in the four elements with attribute itemprop getting logged to the console.  It will create a shared scope object associated with the div element (empty in this example, if there are no other adjacent be-let's doing some its thing.)



In case you were wondering, be-let doesn't provide any support for avoiding boilerplate when we want to react to modifications made to the scope.  But nothing is stopping us from writing code to do this:

```html
<script nomodule be-let=[itemprop]>
    scope.addEventHandler('name", e => {
      //this fires anytime the value of scope.name is changed.
    });
</script>
```

For the mirror behavior of be-let, that provides more declarative support for managing scope, please see [be-scoping](https://github.com/bahrus/be-scoping).


## Example 2 [TODO]

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

The value of "value" will be the values of the corresponding attribute, i.e. "name", "director", "genre", "trailer".

scope ends up as follows:

```JavaScript
{
    name: 'Avatar'
    director: 'James Cameron',
    genre: 'Science fiction',
    trailer: 'https://youtu.be/0AY1XIkX7bY'
}
```


The syntax of Example 2 above is shorthand for:

```html
<script nomodule be-exporting be-let='{
    "beScoping": ["upSearch", ":not(script)"],
    "for": "itempropAttrs",
    "onMutate": "mutate",
    "onNewMatch": "do"
}'>
  export const Scriptlet = class {
    async mutate (ctx) => {
      if(ctx.added){
        this.do(ctx);
      }
    }
    async do ({target, value, scope}) => {
      scope[value] = ('href' in target) ? target.href : target.textContent;
      target.contentEditable = true;
      
    }
    
  }
</script>
```

itempropAttrs is a way to say "look for all elements with attribute "itemprop" and pass the value of that attribute to the scriptlet contained inside.

The last capital letter has to be an "A" for this to work.  So itempropAs would also work.  If the string doesn't end with an s, it only matches the first element, thereby preventing emitting greenhouse gases unnecessarily. [TODO]

## Example 3: [TODO]

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
    async mutate(ctx){
        if(added){
            target.addEventListener('input', e => {
                this.do(ctx);
            }, {signal: this.#abortController.signal});
            this.do(ctx);
        }else{
            this.#abortController.abort();
        }
    };

    async do ({target, added, value, scope}) => {
      scope[value] = ('href' in target) ? target.href : target.textContent
    }

    
  }

</script>
```

## Example 4:  [TODO]

```html
<div itemscope itemtype="https://schema.org/Movie">
  <h1 itemprop="name">Avatar</h1>
  <span>Director: <span itemprop="director">James Cameron</span> (born August 16,
    1954)</span>
  <span itemprop="genre">Science fiction</span>
  <a href="https://youtu.be/0AY1XIkX7bY" itemprop="trailer">Trailer</a>
</div>
<script nomodule be-let='{
  "for": "itemprops",
  "transform":{
    "contentEditable": true
  },
  "toScope": true
}'>
  ('href' in target) ? target.href : target.textContent
</script>
```

Why?  

1.  If updating lots of things, the verbosity slightly slower.  
2.  When writing out the explicit class in a separate js file, can be more library neutral / easier to test, and the name "value" doesn't have to be specified
3.  At least in this case, the target transform could become a JSON property of the be-let attribute.








