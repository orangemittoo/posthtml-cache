import test from 'ava';
import posthtml from 'posthtml';
import parser from 'posthtml-parser';
import isPromise from 'is-promise';
import queryString from 'query-string';
import plugin from '../src';

function processing(html, options) {
    return posthtml()
        .use(plugin(options))
        .process(html);
}

test('plugin must be function', t => {
    t.true(typeof plugin === 'function');
});

test('should return reject', async t => {
    await t.throws(plugin()());
});

test('should return promise', t => {
    t.true(isPromise(processing('')));
});

test('should add nanoid to style links', async t => {
    const input = '<link rel="stylesheet" href="style.css">';
    const html = (await processing(input)).html;
    const id = queryString.parse(parser(html)[0].attrs.href.split('?')[1]).v;
    t.truthy(id);
    t.is(id.length, 21);
});

test('should add nanoid to script links', async t => {
    const input = '<script src="script.js"></script>';
    const html = (await processing(input)).html;
    const id = queryString.parse(parser(html)[0].attrs.src.split('?')[1]).v;
    t.truthy(id);
    t.is(id.length, 21);
});

test('should add nanoid to iframe links', async t => {
    const input = '<iframe src="index.html"></iframe>';
    const html = (await processing(input, {tags: ['iframe']})).html;
    const id = queryString.parse(parser(html)[0].attrs.src.split('?')[1]).v;
    t.truthy(id);
    t.is(id.length, 21);
});

test('should add nanoid to custome attribute', async t => {
    const input = '<img data-src="lorem.png" alt="attribute not removed" />';
    const html = (await processing(input, {attributes: ['data-src']})).html;

    const id = queryString.parse(parser(html)[0].attrs['data-src'].split('?')[1]).v;
    const alt = parser(html)[0].attrs.alt;
    t.truthy(id);
    t.truthy(alt);
    t.is(alt, 'attribute not removed');
    t.is(id.length, 21);
});

test('should not remove other attributes', async t => {
    const input = '<link rel="stylesheet" href="style.css">';
    const html = (await processing(input)).html;

    const id = queryString.parse(parser(html)[0].attrs['href'].split('?')[1]).v;
    const rel = parser(html)[0].attrs.rel;
    t.truthy(id);
    t.truthy(rel);
    t.is(rel, 'stylesheet');
    t.is(id.length, 21);
});
