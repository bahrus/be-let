# be-let [TODO]

*be-let* turns a section of HTML into tiny unnamed islands of interactivity -- is-lets (get it?).

To make it happen, developers can create reusable "scriptlets" similar in concept to this [stranded technology](https://learn.microsoft.com/en-us/previous-versions/office/developer/office2000/aa189871(v=office.10)?redirectedfrom=MSDN). Then, as time permits, it should be easy to formalize the scriptlet into to an element decorator / behavior or even a web component should the needs arise (solidifying requirements, reusable )

It's also kind of like jquery via script tags (but admittedly a little more verbose)

## Example 1 [TODO]

```html
<div itemscope itemtype="https://schema.org/Movie">
  <h1 itemprop="name">Avatar</h1>
  <span>Director: <span itemprop="director">James Cameron</span> (born August 16,
    1954)</span>
  <span itemprop="genre">Science fiction</span>
  <a href="https://youtu.be/0AY1XIkX7bY" itemprop="trailer">Trailer</a>
</div>
<script nomodule be-let=itempropAttrs>
    console.log(target, added, value, scope);
    target.contentEditable = added;
    scope[value] = 
      added ? 
          ('href' in target) ? 
            target.href 
            : target.textContent
      : undefined;
</script>
```

Does the following:

Logs elements with attribute itemprop. "added" will be true always in this example. 

value is the value of the attribute.

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
  export const do = async ({target, added, value, scope}) => {
    console.log(target, added, value, scope);
    target.contentEditable = added;
    scope[value] = added ? 
                  ('href' in target) ? target.href : target.textContent
                : undefined;
  }
</script>
```

## Example 2: [TODO]

```html
<script nomodule be-let='{
  "for": "contenteditableAs",
  "on": "input",
}'>
    scope[value] = target.localName === 'a' ? target.href : target.textContent;
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
    async do({target, added, value, scope}){
        if(added){
            target.addEventListener('input', e => {
                scope[value] = target.localName === 'a' ? target.href : target.textContent;
            }, {signal: this.#abortController.signal})
        }else{
            this.#abortController.abort();
        }
    };
  }

</script>
```

## Example 3 [TODO]

transforms:

1)  If do returns an object, assume it is a transform on the scoping element

2)  allow a transform to be "hardcoded" in the json attribute as well.

3)  host of transform is the scope object
