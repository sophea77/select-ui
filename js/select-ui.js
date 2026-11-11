/*
    MIT License
    Copyright (c) 2023 Sophea LENG
*/

selectUi();

function undoSelectUi() {
    const wrap_native_selects = document.querySelectorAll('.wrap-select-ui');
    for (let i=0; i<wrap_native_selects.length; i++) {
        const native_select = wrap_native_selects[0].querySelector('.select-ui-class');
        native_select.classList.remove("select-ui-class");
        wrap_native_selects[0].after(native_select);
        wrap_native_selects[0].remove();
    }
}

/**
 * Reset selectUi to it first or default option by given element
 * @param el : select element
 */
function setSelectUiToDefault(el) {
    selectUi(el.options[0].value, el.id);
}

/**
 * This function renders a new UI for all select elements with the class select-ui-class
 * Typically, the two parames (default_option and id_selector) are used to re-select the
 * default option by providing the default value of the desired option and the selector ID of the
 * native select element.
 * @param default_option : default option value of the native select
 * @param id_selector : selector ID of the native select element
 * @scope_elment : accepts parent elemnt of select elements. assume we have a parent elemnt that have some select inside it and we need to apply new select ui style to its childs only.
 * for the first and second params if we don't it, just pass undefined. selectUi(undefined, undefined, element)
 */
function selectUi(default_option, id_selector, scope_elment) {

    // the select ui is rendered, but in case need to re-select/refresh its value
    if (default_option !==undefined && id_selector !== undefined) {
        const native_select = document.getElementById(id_selector);
        const wrap_select_ui_children = native_select.closest('.wrap-select-ui').children;

        native_select.value = default_option;
        const selected_option = wrap_select_ui_children[1];
        const wrap_select_ui_option = wrap_select_ui_children[2];

        selected_option.textContent = native_select.querySelector('option:checked')?.textContent;
        const div_options = wrap_select_ui_option.querySelectorAll('.option');
        div_options.forEach((div_option) => {
            if (div_option.classList?.contains('active')) {
                div_option.classList?.remove('active');
            }
        });
        div_options[native_select.selectedIndex]?.classList.add('active');

        return true;
    }

    let native_selects = null;
    if (scope_elment) {
        // grap all select-ui-class elements only from scope_elment
        native_selects = scope_elment.querySelectorAll('.select-ui-class');
    } else {
        // grap all the select-ui-class elemens and render new select UI for them
        native_selects = document.querySelectorAll('.select-ui-class');
    }

    for (let i=0; i<native_selects.length; i++) {
        const native_select = native_selects[i];

        if (native_select == null) {
            continue;
        }

        // create new select UI
        let wrap_select_ui = document.createElement('span');
        wrap_select_ui.classList.add('wrap-select-ui');

        // move navtive_select into wrap_select_ui
        native_select.after(wrap_select_ui);
        wrap_select_ui.append(native_select);

        const native_select_options = native_select.querySelectorAll(`option`);
        // skip the function when there is no option for selecting
        if (native_select_options.length === 0) {
            continue;
        }

        const selected_ui_option = document.createElement('div');
        selected_ui_option.classList.add('selected-option');
        // selected_ui_option.style.width = (native_select.offsetWidth + 18) + 'px';
        selected_ui_option.style.minWidth = (native_select.getBoundingClientRect().width) + 'px';

        const select_ui = document.createElement('div');
        select_ui.setAttribute('class', 'wrap-select-ui-option hidden');

        if (native_select.disabled) {
            selected_ui_option.classList.add("disabled-select");
        }

        // seach feature
        // e.g. to enable search on select 
        // <select data-search="true">...
        const search_el = document.createElement('input');
        if (native_select.dataset['search']) {
            // enable search feature only if native select contain search prop
            search_el.setAttribute('class', 'search-in-select');
            search_el.setAttribute('placeholder', 'search...');
            select_ui.appendChild(search_el);
    
            search_el.addEventListener('keyup', (e) => {
                let div_options = select_ui.querySelectorAll('.option');
                const pattern = e.target.value.toLowerCase();
                for (let i=0; i<div_options.length; i++) {
                    const text = div_options[i].textContent.toLowerCase();
                    if (text.includes(pattern)) {
                        div_options[i].classList.remove('hidden');
                    } else {
                        div_options[i].classList.add('hidden');
                    }
                }
            });
        }

        native_select_options.forEach(function(option, index) {
            let representOp = document.createElement('div');
            // look later for Cross Site Script
            representOp.innerHTML = option.textContent == '' ? '&nbsp;' : option.textContent;
            representOp.setAttribute('class', 'option');
            // add event on div option
            representOp.addEventListener('click', function(event) {
                selected_ui_option.innerHTML = this.innerHTML;
                select_ui.classList.toggle('hidden');
                native_select.value = option.value;

                // fix change event is not trigger after changing the selectedIndex/value of a select
                option.dispatchEvent(new Event('change', { bubbles: true }));
                option.dispatchEvent(new Event('input', { bubbles: true }));

                // remove previous active indicator of drop-down list
                const fps = select_ui.querySelectorAll(`.option`);
                fps.forEach(function(fp) {
                    if (fp.classList.contains('active'))
                        fp.classList.remove('active');
                });
                this.classList.add('active');
            });

            select_ui.appendChild(representOp);
        });

        selected_ui_option.innerHTML = native_select.options[native_select.selectedIndex].innerHTML;

        wrap_select_ui.append(selected_ui_option, select_ui);

        // close select box element when clicking outside
        document.addEventListener('click', function(e) {
            if (e.target !== selected_ui_option && e.target !== search_el) {
                select_ui.classList.add('hidden');
            }
        });

        // don't add listener when it's disabled
        if (! native_select.disabled) {
            selected_ui_option.addEventListener('click', function() {
                select_ui.classList.toggle('hidden');
            });
        }

        // active div option on first load
        select_ui.querySelectorAll('.option')[native_select.selectedIndex].classList.add('active');
    }
}
