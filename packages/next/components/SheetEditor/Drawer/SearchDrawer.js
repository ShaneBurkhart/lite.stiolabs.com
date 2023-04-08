import React, { useContext, useState, useMemo } from 'react';
import _ from 'underscore';

import { SheetEditorContext } from 'project/contexts/SheetEditorContext';

import { DrawerWrapper, DrawerHeader } from './DrawerWrapper';




const makeTable = (str) => {
  const table = new Array(str.length);
  let maxPrefix = 0;

  table[0] = 0;

  for (let i = 1; i < str.length; i++) {
    while (maxPrefix > 0 && str.charAt(i) !== str.charAt(maxPrefix)) {
      maxPrefix = table[maxPrefix - 1];
    }

    if (str.charAt(maxPrefix) === str.charAt(i)) {
      maxPrefix++;
    }
    table[i] = maxPrefix;
  }
  return table;
}

const kmpSearch = (text, searchVal, LPSTable) => {
  if (!searchVal) return;

  const prefixes = LPSTable;
  const matches = [];

  let j = 0;
  let i = 0;
  while (i < text.length) {
    if (text.charAt(i) === searchVal.charAt(j)) {
      i++;
      j++;
    }

    if (j === searchVal.length) {
      matches.push(i - j);
      j = prefixes[j - 1];
    }

    else if (text.charAt(i) !== searchVal.charAt(j)) {
      if (j !== 0) {
        j = prefixes[j - 1];
      } else {
        i++;
      }
    }
  }
  return matches;
}

export default function SearchDrawer({ onClose }) {
  const { textSearchMatches, setTextSearchMatches, textSearchQuery, setTextSearchQuery, detectedFullPageText } = useContext(SheetEditorContext)
  const [searchWordResults, setSearchWordResults] = useState([])
  const [searchParagraphResults, setSearchParagraphResults] = useState([])

  const document = detectedFullPageText?.fullTextAnnotation
  console.log(document)

  const [wordIndex, paragraphIndex, wordLPSTable, paragraphLPSTable] = useMemo(() => {

    const _wordIndex = {};
    const _paragraphIndex = {};
    const _wordLPSTable = {};
    const _paragraphLPSTable = {};

    if (!document) return [_wordIndex, _paragraphIndex, _wordLPSTable, _paragraphLPSTable];

    for (let page of document.pages) {
      for (let block of page.blocks) {
        for (let paragraph of block.paragraphs) {
          const paragraphText = paragraph.words.map(w => w.symbols.map(s => (s.text).toLowerCase()).join('')).join(' ');
          if (!_paragraphIndex[paragraphText]) {
            _paragraphIndex[paragraphText] = [];
          }
          _paragraphIndex[paragraphText].push(paragraph);

          if (!_paragraphLPSTable[paragraphText]) {
            _paragraphLPSTable[paragraphText] = makeTable(paragraphText);
          }
          
          for (let word of paragraph.words) {
            const wordText = word.symbols.map(s => (s.text).toLowerCase()).join('');
            if (!_wordIndex[wordText]) {
              _wordIndex[wordText] = [];
            }
            _wordIndex[wordText].push(word);
            
            if (!_wordLPSTable[wordText]) {
              _wordLPSTable[wordText] = makeTable(wordText);
            }
            
          }
        }
      }
    }
    return [_wordIndex, _paragraphIndex, _wordLPSTable, _paragraphLPSTable];
  }, [document])

  // KMP search of document.text
  const getText = (index) => {
    // get the text that starts at the index
    const text = (document.text).slice(index).trim().split(' ')[0];
    return text;
  }

 const _setTextSearchQuery = (query) => {
    setTextSearchQuery(query)

    if (query === "" || query.length < 1 || !query) setTextSearchMatches([]);

    const queryParts = query.toLowerCase().split(' ');

    const wordKeys = Object.keys(wordIndex);
    const paragraphKeys = Object.keys(paragraphIndex);

    const allWordMatches = [];
    const allParagraphMatches = [];

    // // Get WORD matches and set to state for highlighting text
    // for (let key of wordKeys) {
    //   for (let queryPart of queryParts) {
    //     const _matches = kmpSearch(key, queryPart, wordLPSTable[key])
    //     if (!_matches) return;
    //     if (_matches.length > 0) {
    //       allWordMatches.push(...wordIndex[key]);
    //     } 
        
    //   }
    // }
    // setWordMatches(allWordMatches)

    // Get PARAGRAPH matches and set to state for highlighting text
    if (!paragraphKeys) setTextSearchMatches([]);

    for (let key of paragraphKeys) {
      for (let queryPart of queryParts) {
        const _matches = kmpSearch(key, queryPart, paragraphLPSTable[key])
        if (!_matches) return;
        if (_matches.length > 0) {
          allParagraphMatches.push(...paragraphIndex[key]);
        }
      }
    }
    setTextSearchMatches(allParagraphMatches)
    
    // // Get text from WORD matches and set to state to print results in drawer
    // if (!allWordMatches) return;

    // let _searchWordResults = []

    // for (let match of allWordMatches) {
    //   const result = match.symbols.map(s => s.text).join('');
    //   _searchWordResults.push(result)
    // }

    // setSearchWordResults(_searchWordResults)

    // Get text from PARAGRAPH matches and set to state to print results in drawer
    if (!allParagraphMatches) return;

    let _searchParagraphResults = []

    for (let match of allParagraphMatches) {
      const result = match.words.map(w => w.symbols.map(s => s.text).join('')).join(' ');
      _searchParagraphResults.push(result)
    }

    setSearchParagraphResults(_searchParagraphResults)

    // KMP search of document.text
    // const _matches = kmpSearch((document.text).toLowerCase(), textSearchQuery.toLowerCase())
    // setMatches(_matches)

    // if (!_matches) return;

    // let _searchResults = []

    // for (let i = 0; i < _matches.length; i++) {
    //   console.log('word', getText(_matches[i]))
    //   _searchResults.push(getText(_matches[i]))
    // }

    // setSearchResults(_searchResults)
  }

  const handleOnClose = () => {
    onClose();
    setTextSearchQuery("");
    setTextSearchMatches([]);
    setSearchWordResults([]);
    setSearchParagraphResults([]);
  }

  return (
    <DrawerWrapper>
      <DrawerHeader title="Search" onClose={handleOnClose} />
      <div className="flex flex-col text-sm divide-y divide-gray-200">
        <div className="pt-4">
          <label className="block mb-2 text-base font-medium text-gray-600" htmlFor="searchTerm">Search Text Fields</label>
          <input
            id="searchTerm"
            type="text"
            className="block w-full text-sm border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:border-indigo-300"
            value={textSearchQuery}
            onChange={e => _setTextSearchQuery(e.target.value)}
          />
        </div>
        {textSearchQuery && (
          <SearchResults
            textSearchMatches={textSearchMatches}
            searchWordResults={searchWordResults}
            searchParagraphResults={searchParagraphResults}
          />
        )}
      </div>
    </DrawerWrapper>
  )
}

const SearchResults = ({ searchWordResults, searchParagraphResults, textSearchMatches }) => {

  // TODO: remove duplicate matches based on vertices rather than text so that actual duplicate occurences are preserved
  // This is just for printing the results in the drawer and would be useful if we want to add clickable features to the highlights


  let searchResults = [];

  for (let searchParagraphResult of searchParagraphResults) {
    if (!searchResults.includes(searchParagraphResult)) {
      searchResults.push(searchParagraphResult)
    }
  }

  // for (let searchWordResult of searchWordResults) {
  //   if (!searchParagraphResults.includes(searchWordResult)) {
  //     searchResults.push(searchWordResult)
  //   }
  // }

  return (
    <div className="pt-4">
      {(!searchResults || searchResults.length === 0 ) ? (
        <div className="block mb-2 text-base font-medium text-gray-600">No Results Found</div>
      ) : (
        <>
          <div className="block mb-2 text-base font-medium text-gray-600">Search Results:</div>
          <div className="block w-full text-sm border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:border-indigo-300">
            {searchResults.map((searchResult, index) => (
              <div key={index}>{searchResult}</div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
