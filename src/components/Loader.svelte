<script lang="ts">
  interface tProps {
    autoMargins?: boolean;
    class?: string;
  }

  let props: tProps = $props();
</script>

<div class="container {props.class}" class:auto-margins={props.autoMargins}>
  <div class="loader"></div>
</div>

<style lang="scss">
  @keyframes rotate-and-clip {
    0% {
      clip-path: polygon(50% 50%, 50% 0, 100% 0, 100% 0, 100% 0, 100% 0);
    }

    17% {
      clip-path: polygon(50% 50%, 50% 0, 100% 0, 100% 100%, 100% 100%, 100% 100%);
    }

    33% {
      clip-path: polygon(50% 50%, 50% 0, 100% 0, 100% 100%, 0 100%, 0 100%);
    }

    50% {
      clip-path: polygon(50% 50%, 50% 0, 100% 0, 100% 100%, 0 100%, 0 0);
    }

    58% {
      clip-path: polygon(50% 50%, 100% 0, 100% 0, 100% 100%, 0 100%, 0 0);
    }

    75% {
      clip-path: polygon(50% 50%, 100% 100%, 100% 100%, 100% 100%, 0 100%, 0 0);
    }

    92% {
      clip-path: polygon(50% 50%, 0 100%, 0 100%, 0 100%, 0 100%, 0 0);
    }

    100% {
      clip-path: polygon(50% 50%, 0 50%, 0 50%, 0 50%, 0 50%, 0 0);
      rotate: #{360deg + 90deg};
    }
  }

  @function size() {
    @return calc(var(--size, 30) * 1px);
  }

  .container {
    border-radius: 50%;
    width: size();
    height: size();
    display: block;
    overflow: hidden;

    &.auto-margins {
      margin: 0 auto;
    }
  }

  .loader {
    border-radius: 50%;
    width: size();
    height: size();
    border-style: solid;
    border-width: calc(size() / 6);
    border-color: #3cb49b;
    clip-path: polygon(50% 50%, 50% 0, 100% 0, 100% 0, 100% 0, 100% 0);
    animation: rotate-and-clip 2s linear infinite;
  }
</style>
