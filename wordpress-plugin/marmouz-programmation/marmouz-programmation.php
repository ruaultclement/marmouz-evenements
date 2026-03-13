<?php
/**
 * Plugin Name: Marmouz Programmation
 * Description: Shortcode [marmouz_programmation] pour afficher la programmation depuis booking.laguinguettedesmarmouz.fr.
 * Version: 2.5.0
 * Author: La Guinguette des Marmouz
 */

if (!defined('ABSPATH')) {
    exit;
}

function marmouz_programmation_enqueue_assets() {
    wp_register_style(
        'marmouz-programmation-style',
        plugin_dir_url(__FILE__) . 'style.css',
        array(),
        '2.5.0'
    );
}
add_action('wp_enqueue_scripts', 'marmouz_programmation_enqueue_assets');

function marmouz_icon_svg($type) {
    if ($type === 'whatsapp') {
        return '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.7 14.9L2 22l5.3-1.3A10 10 0 1 0 12 2Zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-3.1.8.8-3.1-.2-.3A8 8 0 1 1 12 20Zm4.3-5.6c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.5.1l-.4.5c-.1.1-.2.2-.5.1a6.5 6.5 0 0 1-1.9-1.2 7.2 7.2 0 0 1-1.3-1.6c-.1-.2 0-.3.1-.4l.3-.3.2-.3.1-.3c0-.1 0-.2-.1-.3l-.7-1.7c-.2-.5-.4-.4-.5-.4h-.4c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 2s.8 2.3.9 2.4c.1.2 1.5 2.4 3.7 3.2.5.2 1 .4 1.3.5.6.2 1.1.2 1.5.1.5-.1 1.4-.6 1.6-1.2.2-.6.2-1.1.1-1.2-.1-.1-.2-.2-.4-.3Z"/></svg>';
    }
    if ($type === 'facebook') {
        return '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M13.5 21v-7h2.3l.4-2.8h-2.7V9.4c0-.8.2-1.4 1.3-1.4h1.5V5.5c-.3 0-1.2-.1-2.3-.1-2.2 0-3.7 1.3-3.7 3.8v2.1H8v2.8h2.3v7h3.2Z"/></svg>';
    }
    if ($type === 'bluesky') {
        return '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 11.2c1.6-2.4 3-4.6 5-6.2 1.5-1.2 3-.8 3 .8 0 1.6-1.5 5.1-2.2 6.5-.8 1.6-2.3 2.3-3.6 2.1 1.5.3 2.8 1.1 3.3 2.5.5 1.2.3 2.9-1 2.9-1 0-1.8-.7-2.5-1.4-.8-.7-1.5-1.6-2-2.6-.5 1-1.2 1.9-2 2.6-.7.7-1.5 1.4-2.5 1.4-1.3 0-1.5-1.7-1-2.9.5-1.4 1.8-2.2 3.3-2.5-1.3.2-2.8-.5-3.6-2.1-.7-1.4-2.2-4.9-2.2-6.5 0-1.6 1.5-2 3-.8 2 1.6 3.4 3.8 5 6.2Z"/></svg>';
    }
    if ($type === 'link') {
        return '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M10.6 13.4a1 1 0 0 1 0-1.4l3.4-3.4a3 3 0 1 1 4.2 4.2l-2.1 2.1a3 3 0 0 1-4.2 0 1 1 0 1 1 1.4-1.4 1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0-1.4-1.4l-3.4 3.4a1 1 0 0 1-1.4 0ZM13.4 10.6a1 1 0 0 1 0 1.4L10 15.4a3 3 0 1 1-4.2-4.2l2.1-2.1a3 3 0 0 1 4.2 0 1 1 0 1 1-1.4 1.4 1 1 0 0 0-1.4 0l-2.1 2.1a1 1 0 1 0 1.4 1.4l3.4-3.4a1 1 0 0 1 1.4 0Z"/></svg>';
    }
    if ($type === 'story') {
        return '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M5 3h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-4.2l-2 3a1 1 0 0 1-1.6 0l-2-3H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm0 2v10h4.7a1 1 0 0 1 .8.4l1.5 2.2 1.5-2.2a1 1 0 0 1 .8-.4H19V5H5Zm7 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z"/></svg>';
    }
    return '';
}

function marmouz_programmation_shortcode($atts) {
    $atts = shortcode_atts(
        array(
            'api' => 'https://booking.laguinguettedesmarmouz.fr/api/programmation-public',
            'analytics_url' => 'https://booking.laguinguettedesmarmouz.fr/api/programmation-analytics',
            'calendar_feed' => 'https://booking.laguinguettedesmarmouz.fr/api/programmation-calendar.ics',
            'cta_url' => 'https://booking.laguinguettedesmarmouz.fr/',
            'cta_label' => 'Viens te produire a la Guinguette',
            'max' => 0,
            'show_details' => '1',
            'show_share' => '1',
            'show_booking_link' => '0',
        ),
        $atts,
        'marmouz_programmation'
    );

    $response = wp_remote_get($atts['api'], array('timeout' => 12));
    if (is_wp_error($response)) {
        return '<div class="marmouz-programmation-error">Programmation indisponible pour le moment.</div>';
    }

    $body = wp_remote_retrieve_body($response);
    $json = json_decode($body, true);

    if (!is_array($json) || !isset($json['items']) || !is_array($json['items'])) {
        return '<div class="marmouz-programmation-error">Aucune programmation disponible.</div>';
    }

    $items = $json['items'];
    $max = intval($atts['max']);
    $show_details = $atts['show_details'] === '1';
    $show_share = $atts['show_share'] === '1';
    $show_booking_link = $atts['show_booking_link'] === '1';
    $analytics_url = esc_url_raw($atts['analytics_url']);
    $calendar_feed = esc_url_raw($atts['calendar_feed']);
    $calendar_feed_webcal = preg_replace('/^https?:/i', 'webcal:', $calendar_feed);
    $calendar_google = 'https://calendar.google.com/calendar/u/0/r?cid=' . rawurlencode($calendar_feed_webcal);
    $page_url = get_permalink();
    if ($max > 0) {
        $items = array_slice($items, 0, $max);
    }

    wp_enqueue_style('marmouz-programmation-style');
    $root_id = 'marmouz-programmation-' . wp_generate_password(8, false, false);

    ob_start();
    ?>
    <section id="<?php echo esc_attr($root_id); ?>" class="marmouz-programmation" data-analytics-url="<?php echo esc_attr($analytics_url); ?>">
        <div class="marmouz-programmation-head">
            <h2>Programmation</h2>
            <a class="marmouz-cta" href="<?php echo esc_url($atts['cta_url']); ?>" target="_blank" rel="noopener noreferrer"><?php echo esc_html($atts['cta_label']); ?></a>
        </div>
        <div class="marmouz-calendar-row">
            <a class="marmouz-calendar-btn" data-analytics-event="calendar_google" href="<?php echo esc_url($calendar_google); ?>" target="_blank" rel="noopener noreferrer">S'abonner Google</a>
            <a class="marmouz-calendar-btn" data-analytics-event="calendar_ical" href="<?php echo esc_url($calendar_feed_webcal); ?>">S'abonner iCal/Apple</a>
            <a class="marmouz-calendar-btn" data-analytics-event="calendar_download" href="<?php echo esc_url($calendar_feed); ?>" target="_blank" rel="noopener noreferrer">Telecharger .ics</a>
        </div>

        <?php if (empty($items)) : ?>
            <article class="marmouz-card"><p>Aucune date confirmee pour l'instant.</p></article>
        <?php else : ?>
            <div class="marmouz-list">
                <?php foreach ($items as $index => $item) : ?>
                    <?php
                    $detail_url = !empty($item['detail_url']) ? $item['detail_url'] : '';
                    $event_anchor = !empty($item['id']) ? sanitize_title($item['id']) : wp_generate_password(6, false, false);
                    $share_url = $page_url ? add_query_arg('event', $event_anchor, $page_url) : $detail_url;
                    $social_url = !empty($detail_url) ? $detail_url : $share_url;
                    $event_title = !empty($item['event_title']) ? $item['event_title'] : 'Evenement';
                    $event_date = !empty($item['date_label']) ? $item['date_label'] : '';
                    $story_text = trim($event_date . ' - ' . $event_title . "\n" . $share_url);
                    $share_text = 'Decouvrez ' . $event_title . ' a La Guinguette des Marmouz : ' . $social_url;
                    $whatsapp_url = 'https://wa.me/?text=' . rawurlencode($share_text);
                    $facebook_url = 'https://www.facebook.com/sharer/sharer.php?u=' . rawurlencode($social_url);
                    $bluesky_url = 'https://bsky.app/intent/compose?text=' . rawurlencode($share_text);
                    $modal_id = 'marmouz-modal-' . $event_anchor;
                    $has_prev = $index > 0;
                    $has_next = $index < (count($items) - 1);
                    ?>
                    <article class="marmouz-card" id="marmouz-event-<?php echo esc_attr($event_anchor); ?>">
                        <p class="marmouz-date"><?php echo esc_html($event_date); ?></p>
                        <h3><?php echo esc_html($event_title); ?></h3>
                        <p class="marmouz-subtitle"><?php echo esc_html($item['subtitle']); ?></p>
                        <?php if (!empty($item['location'])) : ?>
                            <p class="marmouz-location"><?php echo esc_html($item['location']); ?></p>
                        <?php endif; ?>

                        <?php if ($show_details && !empty($item['details'])) : ?>
                            <button
                                type="button"
                                class="marmouz-more-btn marmouz-open-modal"
                                data-modal-id="<?php echo esc_attr($modal_id); ?>"
                                data-index="<?php echo esc_attr((string) $index); ?>"
                                data-event-anchor="<?php echo esc_attr($event_anchor); ?>"
                            >
                                Voir plus de details
                            </button>

                            <div
                                id="<?php echo esc_attr($modal_id); ?>"
                                class="marmouz-modal"
                                data-index="<?php echo esc_attr((string) $index); ?>"
                                data-event-anchor="<?php echo esc_attr($event_anchor); ?>"
                                hidden
                            >
                                <div class="marmouz-modal-backdrop marmouz-close-modal" data-modal-id="<?php echo esc_attr($modal_id); ?>"></div>
                                <div class="marmouz-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="<?php echo esc_attr($modal_id . '-title'); ?>">
                                    <button type="button" class="marmouz-modal-close marmouz-close-modal" data-modal-id="<?php echo esc_attr($modal_id); ?>" aria-label="Fermer">×</button>
                                    <div class="marmouz-modal-nav">
                                        <button
                                            type="button"
                                            class="marmouz-modal-nav-btn"
                                            data-direction="-1"
                                            data-current-index="<?php echo esc_attr((string) $index); ?>"
                                            <?php echo $has_prev ? '' : 'disabled'; ?>
                                        >
                                            ← Precedent
                                        </button>
                                        <button
                                            type="button"
                                            class="marmouz-modal-nav-btn"
                                            data-direction="1"
                                            data-current-index="<?php echo esc_attr((string) $index); ?>"
                                            <?php echo $has_next ? '' : 'disabled'; ?>
                                        >
                                            Suivant →
                                        </button>
                                    </div>
                                    <p class="marmouz-modal-date"><?php echo esc_html($event_date); ?></p>
                                    <h3 id="<?php echo esc_attr($modal_id . '-title'); ?>"><?php echo esc_html($event_title); ?></h3>
                                    <p class="marmouz-subtitle"><?php echo esc_html($item['subtitle']); ?></p>
                                    <?php if (!empty($item['location'])) : ?>
                                        <p class="marmouz-location"><?php echo esc_html($item['location']); ?></p>
                                    <?php endif; ?>
                                    <?php if (!empty($item['photo_url'])) : ?>
                                        <img class="marmouz-photo" src="<?php echo esc_url($item['photo_url']); ?>" alt="<?php echo esc_attr($event_title); ?>" loading="lazy" />
                                    <?php endif; ?>
                                    <p class="marmouz-details"><?php echo nl2br(esc_html($item['details'])); ?></p>

                                    <?php if ($show_share) : ?>
                                        <div class="marmouz-share-row marmouz-modal-share-row">
                                            <a class="marmouz-icon-btn" href="<?php echo esc_url($whatsapp_url); ?>" target="_blank" rel="noopener noreferrer" title="WhatsApp" aria-label="Partager sur WhatsApp" data-analytics-event="share_whatsapp"><?php echo marmouz_icon_svg('whatsapp'); ?></a>
                                            <a class="marmouz-icon-btn" href="<?php echo esc_url($facebook_url); ?>" target="_blank" rel="noopener noreferrer" title="Facebook" aria-label="Partager sur Facebook" data-analytics-event="share_facebook"><?php echo marmouz_icon_svg('facebook'); ?></a>
                                            <a class="marmouz-icon-btn" href="<?php echo esc_url($bluesky_url); ?>" target="_blank" rel="noopener noreferrer" title="Bluesky" aria-label="Partager sur Bluesky" data-analytics-event="share_bluesky"><?php echo marmouz_icon_svg('bluesky'); ?></a>
                                            <button type="button" class="marmouz-icon-btn marmouz-copy-btn" title="Copier lien" aria-label="Copier le lien" data-copy-url="<?php echo esc_url($share_url); ?>" data-analytics-event="share_copy_link"><?php echo marmouz_icon_svg('link'); ?></button>
                                            <button type="button" class="marmouz-icon-btn marmouz-story-btn" title="Copier Story" aria-label="Copier pour Story" data-copy-story="<?php echo esc_attr($story_text); ?>" data-analytics-event="share_copy_story"><?php echo marmouz_icon_svg('story'); ?></button>
                                        </div>
                                    <?php endif; ?>

                                    <?php if ($show_booking_link) : ?>
                                        <p class="marmouz-actions">
                                            <a href="<?php echo esc_url($detail_url); ?>" target="_blank" rel="noopener noreferrer">Voir la fiche booking</a>
                                        </p>
                                    <?php endif; ?>
                                </div>
                            </div>
                        <?php endif; ?>

                        <?php if (!empty($item['photo_url'])) : ?>
                            <img class="marmouz-photo" src="<?php echo esc_url($item['photo_url']); ?>" alt="<?php echo esc_attr($event_title); ?>" loading="lazy" />
                        <?php endif; ?>

                        <?php if ($show_booking_link) : ?>
                            <p class="marmouz-actions">
                                <a href="<?php echo esc_url($detail_url); ?>" target="_blank" rel="noopener noreferrer">Voir la fiche booking</a>
                            </p>
                        <?php endif; ?>

                        <?php if ($show_share) : ?>
                            <div class="marmouz-share-row">
                                <a class="marmouz-icon-btn" href="<?php echo esc_url($whatsapp_url); ?>" target="_blank" rel="noopener noreferrer" title="WhatsApp" aria-label="Partager sur WhatsApp" data-analytics-event="share_whatsapp"><?php echo marmouz_icon_svg('whatsapp'); ?></a>
                                <a class="marmouz-icon-btn" href="<?php echo esc_url($facebook_url); ?>" target="_blank" rel="noopener noreferrer" title="Facebook" aria-label="Partager sur Facebook" data-analytics-event="share_facebook"><?php echo marmouz_icon_svg('facebook'); ?></a>
                                <a class="marmouz-icon-btn" href="<?php echo esc_url($bluesky_url); ?>" target="_blank" rel="noopener noreferrer" title="Bluesky" aria-label="Partager sur Bluesky" data-analytics-event="share_bluesky"><?php echo marmouz_icon_svg('bluesky'); ?></a>
                                <button type="button" class="marmouz-icon-btn marmouz-copy-btn" title="Copier lien" aria-label="Copier le lien" data-copy-url="<?php echo esc_url($share_url); ?>" data-analytics-event="share_copy_link"><?php echo marmouz_icon_svg('link'); ?></button>
                                <button type="button" class="marmouz-icon-btn marmouz-story-btn" title="Copier Story" aria-label="Copier pour Story" data-copy-story="<?php echo esc_attr($story_text); ?>" data-analytics-event="share_copy_story"><?php echo marmouz_icon_svg('story'); ?></button>
                            </div>
                        <?php endif; ?>
                    </article>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>
    </section>
    <?php if ($show_share || $show_details) : ?>
    <script>
    (function () {
      var root = document.getElementById('<?php echo esc_js($root_id); ?>');
      if (!root) return;

      var transitionMs = 180;
      var openButtons = Array.prototype.slice.call(root.querySelectorAll('.marmouz-open-modal'));
      var modalOrder = openButtons
        .map(function (btn) { return btn.getAttribute('data-modal-id') || ''; })
        .filter(function (id) { return !!id; });
      var modalIndexById = {};
      modalOrder.forEach(function (id, idx) { modalIndexById[id] = idx; });
      var openModalIndex = null;
      var analyticsUrl = root.getAttribute('data-analytics-url') || '';

      function track(eventName, payload) {
        if (!analyticsUrl || !eventName) return;

        var body = JSON.stringify({
          event: eventName,
          page: window.location.href,
          payload: payload || {},
          ts: new Date().toISOString()
        });

        if (navigator.sendBeacon) {
          var blob = new Blob([body], { type: 'application/json' });
          navigator.sendBeacon(analyticsUrl, blob);
          return;
        }

        fetch(analyticsUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: body,
          keepalive: true
        }).catch(function () {});
      }

      function getModalById(modalId) {
        if (!modalId) return null;
        var modal = document.getElementById(modalId);
        if (!modal) return null;
        return root.contains(modal) ? modal : null;
      }

      function getModalIndex(modalId) {
        if (!modalId) return -1;
        if (Object.prototype.hasOwnProperty.call(modalIndexById, modalId)) {
          return modalIndexById[modalId];
        }
        // Fallback: resolve index from DOM if map misses for any reason.
        for (var i = 0; i < openButtons.length; i += 1) {
          if ((openButtons[i].getAttribute('data-modal-id') || '') === modalId) {
            return i;
          }
        }
        return -1;
      }

      function setBodyLock() {
        var opened = document.querySelectorAll('.marmouz-modal.is-open');
        if (opened.length) {
          document.body.classList.add('marmouz-modal-open');
        } else {
          document.body.classList.remove('marmouz-modal-open');
        }
      }

      function updateNavForModal(modal) {
        if (!modal) return;
        var current = getModalIndex(modal.id);
        var navButtons = modal.querySelectorAll('.marmouz-modal-nav-btn');
        navButtons.forEach(function (btn) {
          var direction = parseInt(btn.getAttribute('data-direction') || '0', 10);
          var next = current + direction;
          btn.disabled = next < 0 || next >= modalOrder.length;
        });
      }

      function updateUrlEventParam(anchor) {
        var url = new URL(window.location.href);
        if (anchor) {
          url.searchParams.set('event', anchor);
        } else {
          url.searchParams.delete('event');
        }
        window.history.replaceState({}, '', url.toString());
      }

      function closeModalById(modalId) {
        var modal = getModalById(modalId);
        if (!modal) return;
        openModalIndex = null;
        modal.classList.remove('is-open');
        window.setTimeout(function () {
          modal.hidden = true;
          setBodyLock();
        }, transitionMs);
        updateUrlEventParam('');
      }

      function closeAllModals() {
        openModalIndex = null;
        var opened = root.querySelectorAll('.marmouz-modal.is-open');
        opened.forEach(function (modal) {
          modal.classList.remove('is-open');
          window.setTimeout(function () {
            modal.hidden = true;
            setBodyLock();
          }, transitionMs);
        });
        updateUrlEventParam('');
      }

      function openModalById(modalId, index, source) {
        var modal = getModalById(modalId);
        if (!modal) return;
        closeAllModals();
        modal.hidden = false;
        window.requestAnimationFrame(function () {
          modal.classList.add('is-open');
          setBodyLock();
        });
        var resolvedIndex = typeof index === 'number' && index >= 0 ? index : getModalIndex(modalId);
        openModalIndex = resolvedIndex;
        updateNavForModal(modal);
        var anchor = modal.getAttribute('data-event-anchor') || '';
        updateUrlEventParam(anchor);
        track('modal_open', { source: source || 'click', event_anchor: anchor });
      }

      openButtons.forEach(function (btn) {
        btn.addEventListener('click', function () {
          var modalId = btn.getAttribute('data-modal-id');
          var index = getModalIndex(modalId);
          if (index < 0) {
            index = parseInt(btn.getAttribute('data-index') || '-1', 10);
          }
          if (modalId && index >= 0) {
            openModalById(modalId, index, 'button');
          }
        });
      });

      var closeButtons = root.querySelectorAll('.marmouz-close-modal');
      closeButtons.forEach(function (btn) {
        btn.addEventListener('click', function () {
          var modalId = btn.getAttribute('data-modal-id');
          if (modalId) closeModalById(modalId);
        });
      });

      var navButtons = root.querySelectorAll('.marmouz-modal-nav-btn');
      navButtons.forEach(function (btn) {
        btn.addEventListener('click', function () {
          var direction = parseInt(btn.getAttribute('data-direction') || '0', 10);
          var modal = null;
          if (btn.closest) {
            modal = btn.closest('.marmouz-modal');
          } else {
            var parent = btn.parentElement;
            while (parent) {
              if (parent.classList && parent.classList.contains('marmouz-modal')) {
                modal = parent;
                break;
              }
              parent = parent.parentElement;
            }
          }
          if (!modal) return;
          var current = getModalIndex(modal.id);
          if (current < 0 && openModalIndex !== null) {
            current = openModalIndex;
          }
          if (current < 0) {
            current = parseInt(btn.getAttribute('data-current-index') || '-1', 10);
          }
          var next = current + direction;
          if (next < 0 || next >= modalOrder.length) return;
          var targetModalId = modalOrder[next];
          if (targetModalId) {
            openModalById(targetModalId, next, direction > 0 ? 'next' : 'previous');
          }
        });
      });

      var calendarButtons = root.querySelectorAll('.marmouz-calendar-btn[data-analytics-event]');
      calendarButtons.forEach(function (btn) {
        btn.addEventListener('click', function () {
          var eventName = btn.getAttribute('data-analytics-event') || '';
          track(eventName, {});
        });
      });

      document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
          closeAllModals();
          return;
        }

        if (openModalIndex === null) return;
        if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;

        var direction = event.key === 'ArrowRight' ? 1 : -1;
        var next = openModalIndex + direction;
        if (next < 0 || next >= modalOrder.length) return;

        var targetModalId = modalOrder[next];
        if (targetModalId) {
          openModalById(targetModalId, next, direction > 0 ? 'key_next' : 'key_previous');
        }
      });

      var copyButtons = root.querySelectorAll('.marmouz-copy-btn');
      copyButtons.forEach(function (btn) {
        btn.addEventListener('click', function () {
          var url = btn.getAttribute('data-copy-url') || '';
          if (!url) return;

          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url).then(function () {
              btn.classList.add('is-copied');
              window.setTimeout(function () { btn.classList.remove('is-copied'); }, 1200);
            });
          } else {
            window.prompt('Copiez ce lien :', url);
          }
          track(btn.getAttribute('data-analytics-event') || 'share_copy_link', {});
        });
      });

      var storyButtons = root.querySelectorAll('.marmouz-story-btn');
      storyButtons.forEach(function (btn) {
        btn.addEventListener('click', function () {
          var text = btn.getAttribute('data-copy-story') || '';
          if (!text) return;

          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(function () {
              btn.classList.add('is-copied');
              window.setTimeout(function () { btn.classList.remove('is-copied'); }, 1200);
            });
          } else {
            window.prompt('Copiez ce texte Story :', text);
          }
          track(btn.getAttribute('data-analytics-event') || 'share_copy_story', {});
        });
      });

      var shareLinks = root.querySelectorAll('.marmouz-icon-btn[data-analytics-event]');
      shareLinks.forEach(function (btn) {
        if (btn.tagName.toLowerCase() !== 'a') return;
        btn.addEventListener('click', function () {
          track(btn.getAttribute('data-analytics-event') || 'share_link', {});
        });
      });

      var targetEvent = new URL(window.location.href).searchParams.get('event');
      if (targetEvent) {
        var targetBtn = root.querySelector('.marmouz-open-modal[data-event-anchor="' + targetEvent + '"]');
        if (targetBtn) {
          var targetModalId = targetBtn.getAttribute('data-modal-id');
          var targetIndex = getModalIndex(targetModalId);
          if (targetModalId && targetIndex >= 0) {
            openModalById(targetModalId, targetIndex, 'deeplink');
          }
        }
      }

      setBodyLock();
    })();
    </script>
    <?php endif; ?>
    <?php

    return ob_get_clean();
}
add_shortcode('marmouz_programmation', 'marmouz_programmation_shortcode');

function marmouz_dates_ouvertes_shortcode($atts) {
  $atts = shortcode_atts(
    array(
      'api' => 'https://booking.laguinguettedesmarmouz.fr/api/dates-open-public',
      'title' => 'Dates ouvertes',
      'intro' => 'Voici les prochaines dates ouvertes, vous pouvez postuler sur celles qui vous interessent.',
      'cta_url' => 'https://booking.laguinguettedesmarmouz.fr/proposer',
      'cta_label' => 'Proposer mon groupe',
      'max' => 0,
      'show_lieu' => '1',
      'lieu_nom' => 'La Guinguette des Marmouz',
      'lieu_adresse' => '',
      'lieu_ville' => 'Plouer-sur-Rance',
      'lieu_infos' => '',
      'lieu_map_url' => '',
    ),
    $atts,
    'marmouz_dates_ouvertes'
  );

  $response = wp_remote_get($atts['api'], array('timeout' => 12));
  if (is_wp_error($response)) {
    return '<div class="marmouz-programmation-error">Dates ouvertes indisponibles pour le moment.</div>';
  }

  $json = json_decode(wp_remote_retrieve_body($response), true);
  if (!is_array($json) || !isset($json['items']) || !is_array($json['items'])) {
    return '<div class="marmouz-programmation-error">Aucune date ouverte disponible.</div>';
  }

  $items = $json['items'];
  $max = intval($atts['max']);
  if ($max > 0) {
    $items = array_slice($items, 0, $max);
  }

  $show_lieu = $atts['show_lieu'] === '1';

  wp_enqueue_style('marmouz-programmation-style');

  ob_start();
  ?>
  <section class="marmouz-programmation marmouz-open-dates">
    <div class="marmouz-programmation-head">
      <h2><?php echo esc_html($atts['title']); ?></h2>
      <a class="marmouz-cta" href="<?php echo esc_url($atts['cta_url']); ?>" target="_blank" rel="noopener noreferrer"><?php echo esc_html($atts['cta_label']); ?></a>
    </div>

    <?php if (!empty($atts['intro'])) : ?>
      <p class="marmouz-open-intro"><?php echo esc_html($atts['intro']); ?></p>
    <?php endif; ?>

    <?php if ($show_lieu) : ?>
      <article class="marmouz-card marmouz-lieu-card">
        <h3><?php echo esc_html($atts['lieu_nom']); ?></h3>
        <?php if (!empty($atts['lieu_adresse'])) : ?>
          <p class="marmouz-location"><?php echo esc_html($atts['lieu_adresse']); ?></p>
        <?php endif; ?>
        <?php if (!empty($atts['lieu_ville'])) : ?>
          <p class="marmouz-location"><?php echo esc_html($atts['lieu_ville']); ?></p>
        <?php endif; ?>
        <?php if (!empty($atts['lieu_infos'])) : ?>
          <p class="marmouz-subtitle"><?php echo esc_html($atts['lieu_infos']); ?></p>
        <?php endif; ?>
        <?php if (!empty($atts['lieu_map_url'])) : ?>
          <p class="marmouz-actions">
            <a href="<?php echo esc_url($atts['lieu_map_url']); ?>" target="_blank" rel="noopener noreferrer">Voir la carte</a>
          </p>
        <?php endif; ?>
      </article>
    <?php endif; ?>

    <?php if (empty($items)) : ?>
      <article class="marmouz-card"><p>Aucune date ouverte pour le moment.</p></article>
    <?php else : ?>
      <div class="marmouz-list">
        <?php foreach ($items as $item) : ?>
          <article class="marmouz-card">
            <p class="marmouz-date"><?php echo esc_html(isset($item['date_label']) ? $item['date_label'] : 'Date a confirmer'); ?></p>
            <?php if (!empty($item['description'])) : ?>
              <p class="marmouz-subtitle"><?php echo esc_html($item['description']); ?></p>
            <?php endif; ?>
          </article>
        <?php endforeach; ?>
      </div>
    <?php endif; ?>
  </section>
  <?php

  return ob_get_clean();
}
add_shortcode('marmouz_dates_ouvertes', 'marmouz_dates_ouvertes_shortcode');
