import React, { useEffect, useRef, useState } from "react";
import { SWATCHES } from "@/constants";
import { ColorSwatch, Group } from "@mantine/core";
import { Button } from "@/components/ui/button";
import Draggable from "react-draggable";
import axios from "axios";

interface GeneratedResult {
  expression: string;
  answer: string;
}

interface Response {
  expr: string;
  result: string;
  assign: boolean;
}

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("rgb(255,255,255)");
  const [reset, setReset] = useState(false);
  const [result, setResult] = useState<GeneratedResult>();
  const [latexExpression, setLatexExpression] = useState<Array<string>>([]);
  const [latexPosition, setLatexPosition] = useState({ x: 10, y: 200 });
  const [dictOfVars, setDictOfVars] = useState({});

  useEffect(() => {
    if (reset) {
      resetCanvas();
      setLatexExpression([]);
      setResult(undefined);
      setDictOfVars({});
      setReset(false);
    }
  }, [reset]);

  useEffect(() => {
    if (result) {
      renderLatexToCanvas(result.expression, result.answer);
    }
  }, [result]);

  useEffect(() => {
    if (latexExpression.length > 0 && window.MathJax) {
      setTimeout(() => {
        window.MathJax.Hub.Queue(["Typeset", window.MathJax.Hub]);
      }, 0);
    }
  }, [latexExpression]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight - canvas.offsetTop;

        // Set background to black
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }

    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.9/config/TeX-AMS_HTML-full.min.js";
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      window.MathJax.Hub.Config({
        tex2jax: { inlineMath: [["$", "$"], ["\\(", "\\)"]] },
      });
    };

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const renderLatexToCanvas = (expression: string, answer: string) => {
    const latex = `\\(\\LARGE{${expression} = ${answer}}\\)`;
    setLatexExpression([...latexExpression, latex]);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Set background to black again
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const sendData = async () => {
    try {
      const canvas = canvasRef.current;

      if (canvas) {
        // Make API call
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/calculate`,
          {
            image: canvas.toDataURL("image/png"),
            dict_of_vars: dictOfVars,
          }
        );

        console.log("API Response:", response);

        // Validate response structure
        const responseData = response.data;

        // Check if the response contains 'data' and 'results' array
        if (responseData && Array.isArray(responseData.data)) {
          const dataArray: Response[] = responseData.data;

          // Process the array data
          dataArray.forEach((data: Response) => {
            if (data.assign === true) {
              setDictOfVars((prevVars) => ({
                ...prevVars,
                [data.expr]: data.result,
              }));
            }

            const canvasCtx = canvas.getContext("2d");
            if (canvasCtx) {
              const imageData = canvasCtx.getImageData(
                0,
                0,
                canvas.width,
                canvas.height
              );
              let minX = canvas.width,
                minY = canvas.height,
                maxX = 0,
                maxY = 0;

              for (let y = 0; y < canvas.height; y++) {
                for (let x = 0; x < canvas.width; x++) {
                  if (imageData.data[(y * canvas.width + x) * 4 + 3] > 0) {
                    if (x < minX) minX = x;
                    if (x > maxX) maxX = x;
                    if (y < minY) minY = y;
                    if (y > maxY) maxY = y;
                  }
                }
              }

              const centerX = (minX + maxX) / 2;
              const centerY = (minY + maxY) / 2;

              setLatexPosition({ x: centerX, y: centerY });

              setTimeout(() => {
                setResult({
                  expression: data.expr,
                  answer: data.result,
                });
              }, 1000);
            }
          });
        } else {
          throw new Error("Unexpected response format. Expected 'data' array.");
        }
      }
    } catch (error) {
      console.error("Error sending data:", error);
    }
  };

  const resetCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Reset background to black
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
        ctx.strokeStyle = color; // Use the selected color
      }
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
        ctx.stroke();
      }
    }
  };

  return (
    <>
      <div className="grid grid-cols-3 gap-2 p-4">
        {/* Reset Button */}
        <Button
          onClick={() => setReset(true)}
          className="z-20 bg-black text-white"
          variant="default"
        >
          Reset
        </Button>

        {/* Color Swatches */}
        <Group className="z-20">
          {SWATCHES.map((swatchColor: string) => (
            <ColorSwatch
              key={swatchColor}
              color={swatchColor}
              onClick={() => setColor(swatchColor)}
              style={{
                cursor: "pointer",
                border:
                  color === swatchColor ? "2px solid white" : "1px solid black",
              }}
            />
          ))}
        </Group>

        {/* Calculate Button */}
        <Button
          onClick={sendData}
          className="z-20 bg-black text-white"
          variant="default"
        >
          Calculate
        </Button>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        id="canvas"
        className="absolute top-0 left-0 w-full h-full"
        onMouseDown={startDrawing}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
        onMouseMove={draw}
      />

      {/* Render Latex Expression */}
      {result && (
        <div
          style={{
            position: "absolute",
            top: `${latexPosition.y}px`,
            left: `${latexPosition.x}px`,
            color: "white",
            fontSize: "30px",
            fontFamily: "Arial, sans-serif",
            background: "rgba(0, 0, 0, 0.5)",
            padding: "5px",
            borderRadius: "5px",
          }}
        >
          {result.expression} = {result.answer}
        </div>
      )}

      {latexExpression &&
        latexExpression.map((latex, index) => (
          <Draggable
            key={index}
            defaultPosition={latexPosition}
            onStop={(e, data) => setLatexPosition({ x: data.x, y: data.y })}
          >
            <div className="absolute p-2 text-white rounded shadow-md">
              <div className="latex-content">{latex}</div>
            </div>
          </Draggable>
        ))}
    </>
  );
}
