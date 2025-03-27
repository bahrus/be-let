Extract values from other attributes of the element that the enhancement adorns.

```html
<table>
    <tr id=testRow aria-rowindex=11 be-let be-let-a="aria-rowindex as number">
    </tr>
</table>
<script>
    const beLet = testRow.beEnhanced.beLet;
    console.log(beLet.props.a - 3);
    // 8
    beLet.props.addEventListener('a', e => {
        console.log(beLet.props.a - 3);
        //2
    });
    tesRow.ariaRowindex = 5;
</script>
```