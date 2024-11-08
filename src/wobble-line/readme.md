# WobblingLine
This custom-element creates a canvas and aims to draw a line that wobbles regularly up and down
like a long rope, or a sine wave if you prefer.

Populate the tag with an arbitrary amount of WobblingSegment(s), each of them represents a curve
that wobbles. They are defined by a central point, a length, a frequency, an amplitude and a
phase delay.

### Line's attributes
<table>
	<tr>
		<th>Name</th>
		<th>Type</th>
		<th>Description</th>
	</tr>
	<tr>
		<td><code>tick</code></td>
		<td>int</td>
		<td>The amount of milliseconds between the updates. The lower the value the higher the FPS.</td>
	</tr>
</table>

### Segments' attributes
<table>
	<tr>
		<th>Name</th>
		<th>Type</th>
		<th>Description</th>
	</tr>
	<tr>
		<td><code>p</code></td>
		<td>float</td>
		<td>The float factor 0.0 - 1.0 that pivots the segment along the line. It corresponds to the center of the segment. 0.0 is the left edge of the canvas, 1.0 is the right edge of the canvas.</td>
	</tr>
	<tr>
		<td><code>l</code></td>
		<td>float</td>
		<td>The length of the segment, expressed as a factor, a float number between 0.0 and 1.0, where 0.0 is no-length and 1.0 is full canvas width.</td>
	</tr>
	<tr>
		<td><code>a</code></td>
		<td>float</td>
		<td>The max amplitude of the oscillation. It if a float number factor from 0.0 to 1.0, where 0.0 is no oscillation and 1.0 is touching the bounds of the WobblingLine container (that is, all the space available).</td>
	</tr>
	<tr>
		<td><code>f</code></td>
		<td>float</td>
		<td>The frequency (in Hz) is the amount of complete oscillations to perform in a second. Must be positive and greater than 0.</td>
	</tr>
	<tr>
		<td><code>d</code></td>
		<td>int</td>
		<td>The virtual delay to apply in milliseconds to the real time. You can this of it as the amount of milliseconds to wait before starting (although it is not exactly so).</td>
	</tr>
	<tr>
		<td><code>onphase</code></td>
		<td>string</td>
		<td>
			Adds the function named in the attribute as a listener of the oscillation phase of the segments. Every segment that reaches (overcomes) 270 degrees oscillation 
			emits an event and calls the callback. Signature:

<table>
	<tr>
		<th>Name</th>
		<th>Type</th>
		<th>Description</th>
	</tr>
	<tr>
		<td><code>segment</code></td>
		<td>WobblingSegment</td>
		<td>The segment that completed the oscillation and raised the event.</td>
	</tr>
	<tr>
		<td><code>prev_angle</code></td>
		<td>float</td>
		<td>The phase angle the segment had in the previous tick: expressed in degrees.</td>
	</tr>
	<tr>
		<td><code>cur_angle</code></td>
		<td>float</td>
		<td>The phase angle the segment has now and caused event to fire: expressed in degrees.</td>
	</tr>
</table>
		</td>
	</tr>
</table>

### How wobbling was calculated
The wobbling was calculated through the following mindflow:

```
	supponendo
		1Hz
	significa che
		0ms	=> 1000ms	= un giro completo
	quindi
		T = (1 / f) = 1s
	perciò mezzo giro
		1s / 2 = 500ms
	il cos è: 0 a 0°, 1 a 90°, 0 a 180°, 1 a 270°, quindi va da sé che
		0° -> 180° in 500ms
	pertanto
		c : 1000 = x : 360
	dove
		c = tick % 1000
	significa che
		ampiezza = max_ampiezza * cos(((tick % 1000) * 360) / 1000)
	max_ampiezza è variabile, ma anche la frequenza, per cui si ha infine
		ampiezza = max_ampiezza * cos(((tick % T) * 360) / T
```

