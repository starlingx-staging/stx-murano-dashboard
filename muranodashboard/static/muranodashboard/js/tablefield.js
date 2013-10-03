/*    Copyright (c) 2013 Mirantis, Inc.

    Licensed under the Apache License, Version 2.0 (the "License"); you may
    not use this file except in compliance with the License. You may obtain
    a copy of the License at

         http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
    WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
    License for the specific language governing permissions and limitations
    under the License.
*/
$(function() {
    var MAX_NODES = 5,
        MIN_NODES = 2;

    function trimLabel(label) {
        return $.trim(label.replace(/(\r\n|\r|\n|↵)/gm, ''));
    }

    function getMaxLabel() {
        var labels = [],
            max = 0,
            base = '';
        $('.data-grid table tbody tr td:first-child').each(function(i, td) {
            labels.push(trimLabel($(td).text()));
        });
        labels.forEach(function(label) {
            var match = /([a-zA-z]+)-([0-9]+)/.exec(label),
                n = +match[2];
            base = match[1];
            if ( n > max )
                max = n;
        });
        return [base, max]
    }

    function getNextLabel() {
        var baseMax = getMaxLabel();
        return baseMax[0]+'-'+(+baseMax[1]+1);
    }

    function getNumOfSync() {
        var checked = 0;
        $('.data-grid table tbody td input:checkbox').each(function(index, cb) {
            if ( $(cb).attr('checked') )
                checked++;
        });
        return checked;
    }

    function validate_sync(event) {
        var checkbox = $(event.target);

        if ( checkbox.attr('checked') ) {
            if ( getNumOfSync() > 2 ) {
                alert('No more than 2 nodes can be in sync-mode!')
                checkbox.attr('checked', false);
            }
        } else if ( checkbox.parents().eq(1).find('input:radio').attr('checked') ) {
            alert('Primary node is always in sync-mode!');
            checkbox.attr('checked', true);
        }
    }

    var primary = $('.data-grid table tbody input:radio[checked="checked"]').parents().eq(1);

    function validate_primary(event) {
        var radio = $(event.target),
            checkbox = radio.parents().eq(1).find('input:checkbox');
        if ( !checkbox.attr('checked') ) {
            if ( getNumOfSync() == 2 )
                primary.find('input:checkbox').attr('checked', false);
            checkbox.attr('checked', true);
        }
        primary = radio.parents().eq(1);
    }

    $('.data-grid table tbody td input:checkbox').click(validate_sync);
    $('.data-grid table tbody td input:radio').click(validate_primary);

    $('button#node-add').click(function() {
        if ( $('.data-grid table tbody tr').length >= MAX_NODES ) {
            alert('Maximum number of nodes ('+MAX_NODES+') already reached.');
            return;
        }
        var lastRow = $('.data-grid table tbody tr:last-child'),
            clone = lastRow.clone(),
            nameCell = clone.find('td:first-child'),
            hidden = nameCell.find('input:hidden'),
            match = /([^@]+)@@([0-9]+)@@(.+)/.exec(hidden.attr('name')),
            index = +match[2]+1,
            nextLabel = getNextLabel();
        nameCell.text(nextLabel);
        hidden.val(nextLabel);
        hidden.attr('name', match[1]+'@@'+index+'@@'+match[3]);
        nameCell.append(hidden);
        // toggle of sync and primary buttons of clone
        clone.find('input:checkbox').attr('checked', false);
        clone.find('input:checkbox').click(validate_sync);
        clone.find('input:radio').attr('checked', false);
        clone.find('input:radio').click(validate_primary);
        lastRow.after(clone);
    });

    $('button#node-remove').click(function() {
        if ( $('.data-grid table tbody tr').length <= MIN_NODES ) {
            alert('There cannot be less than ' + MIN_NODES + ' nodes');
            return;
        }
        var labelNum = getMaxLabel(),
            label = labelNum.join('-'),
            rowRef = '.data-grid table tbody tr:contains('+label+')';
        if ( $(rowRef + ' :radio[checked="checked"]') ) {
            label = labelNum[0] + '-' + (labelNum[1] - 1);
            $('.data-grid table tbody tr:contains('+label+') :radio').attr(
                'checked', 'checked');
        }
        $(rowRef).remove();
    });

    $('.data-grid .table_caption').remove()
});
