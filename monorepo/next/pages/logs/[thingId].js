import { useEffect, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

function parseAnsiToTailwind(text) {
  const escapeRegex = /\x1b\[([\d;]+)m/g; // regular expression to match ANSI escape codes
  let output = text;
  let match;
  let isOpen = false;

  // Loop through all matches of ANSI escape codes in the text
  while ((match = escapeRegex.exec(text)) !== null) {
    const codes = match[1].split(';'); // split the codes into an array

    // Map each code to a Tailwind class
    const classes = codes.map(code => {
      switch (code) {
        case '1': return 'font-bold';
        case '3': return 'italic';
        case '4': return 'underline';
        case '31': return 'text-red-500';
        case '32': return 'text-green-500';
        case '33': return 'text-yellow-500';
        case '34': return 'text-blue-500';
        case '35': return 'text-purple-500';
        case '36': return 'text-cyan-500';
        case '37': return 'text-gray-500';
        case '91': return 'text-red-700';
        case '92': return 'text-green-700';
        case '93': return 'text-yellow-700';
        case '94': return 'text-blue-700';
        case '95': return 'text-purple-700';
        case '96': return 'text-cyan-700';
        case '97': return 'text-gray-700';
        default: return '';
      }
    }).filter(className => className !== ''); // remove any empty classes

    // Replace the ANSI escape code with a Tailwind class
    // add closing tag is 
    const openTag = classes.length ? `<span class="${classes.join(' ')}">` : '';
    const replaceText = !isOpen ? openTag : `</span>${openTag}`
    output = output.replace(match[0], replaceText);

    // a little weird but it controls if the last tag was an opening tag
    if (!classes.length) {
      isOpen = false;
    } else {
      isOpen = true;
    }
  }

  // // Replace the ANSI reset code with a closing span tag
  // output = output.replace(/\x1b\[0m/g, '</span>');

  return output;
}


const ThingLogs = ({ thingId }) => {
  const [logs, setLogs] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch(`https://monorepo_logs.shane.stiolabs.com/${thingId}.txt`, { credentials: 'include' });
        const reader = response.body.getReader();

        let buffer = '';
        let done = false;

        while (!done) {
          const { value, done: isDone } = await reader.read();

          if (isDone) {
            done = true;
          } else {
            buffer += new TextDecoder('utf-8').decode(value);
            const endIndex = buffer.indexOf('===== END =====');
            const parsedLogs = parseAnsiToTailwind(buffer.slice(0, endIndex));
            setLogs(parsedLogs);

            if (endIndex !== -1) {
              clearInterval(intervalId);
              done = true;
            }
          }
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchLogs();

    const intervalId = setInterval(fetchLogs, 1000);

    return () => clearInterval(intervalId);
  }, [thingId]);


  return (
    <div className="w-full h-full flex items-center justify-center text-xs">
      {logs ? (
        <pre className="w-full h-full overflow-auto p-3" dangerouslySetInnerHTML={{ __html: logs }} />
      ) : (
        <p>Loading logs...</p>
      )}
    </div>
  );
};

export default ThingLogs;

export async function getServerSideProps({ params }) {
  return {
    props: {
      thingId: params.thingId,
    },
  };
}
